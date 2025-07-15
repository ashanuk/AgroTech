import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/product';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const title = url.searchParams.get('title') || '';

        const farmerId = url.searchParams.get('farmerId') || '';

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;


        let products;
        let total;

        if (title.trim()) {
            // Search products with Atlas Search fuzzy matching when title is provided
            const searchPipeline = [
                {
                    $search: {
                        index: 'default',
                        text: {
                            query: title,
                            path: 'title',
                            fuzzy: {
                                maxEdits: 2,
                                prefixLength: 1
                            }
                        }
                    }
                },
                // Add farmerId filter if provided
                ...(farmerId ? [{ $match: { farmerId: farmerId } }] : []),
                { $project: { _id: 1, title: 1, pricePerKg: 1, availableQuantityKg: 1, description: 1, cropType: 1, farmerId: 1 } },
                { $skip: skip },
                { $limit: limit }
            ];

            products = await Product.aggregate(searchPipeline);

            // Count total matching documents using the same search query
            const countPipeline = [
                {
                    $search: {
                        index: 'default',
                        text: {
                            query: title,
                            path: 'title',
                            fuzzy: { maxEdits: 2 },
                        },
                    },
                },
                // Add farmerId filter if provided for count
                ...(farmerId ? [{ $match: { farmerId: farmerId } }] : []),
                { $count: 'total' },
            ];

            const countResults = await Product.aggregate(countPipeline);
            total = countResults.length > 0 ? countResults[0].total : 0;
        } else if (farmerId.trim()) {
            // Filter by farmer ID only when no title search
            products = await Product.find({ farmerId: farmerId })
                .select('_id title pricePerKg availableQuantityKg description cropType farmerId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            total = await Product.countDocuments({ farmerId: farmerId });
        } else {
            // Regular query when no search title or farmerId is provided
            products = await Product.find({})
                .select('_id title pricePerKg availableQuantityKg description cropType farmerId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            total = await Product.countDocuments({});
        }

        return NextResponse.json({
            success: true,
            data: {
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Product search error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search products' },
            { status: 500 }
        );
    }
}


// Additional route for creating a new product
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const data = await req.json();


        // Validate required fields based on the actual model
        if (!data.title || !data.farmerId || !data.pricePerKg || !data.totalQuantityKg || !data.description || !data.cropType) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, farmerId, pricePerKg, totalQuantityKg, description, cropType' },
                { status: 400 }
            );
        }

        // Set available quantity to total quantity initially
        if (!data.availableQuantityKg) {
            data.availableQuantityKg = data.totalQuantityKg;
        }

        const product = await Product.create(data);

        return NextResponse.json({
            success: true,
            data: product
        }, { status: 201 });
    } catch (error) {
        console.error('Product creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }

}

// PUT - Update an existing product
export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const productId = url.searchParams.get('id');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const data = await req.json();

        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate quantity updates - ensure availableQuantityKg doesn't exceed totalQuantityKg
        if (data.totalQuantityKg !== undefined && data.availableQuantityKg !== undefined) {
            if (data.availableQuantityKg > data.totalQuantityKg) {
                return NextResponse.json(
                    { success: false, error: 'Available quantity cannot exceed total quantity' },
                    { status: 400 }
                );
            }
        } else if (data.totalQuantityKg !== undefined && data.availableQuantityKg === undefined) {
            // If only totalQuantityKg is updated, adjust availableQuantityKg proportionally
            const ratio = existingProduct.availableQuantityKg / existingProduct.totalQuantityKg;
            data.availableQuantityKg = Math.min(data.totalQuantityKg, data.totalQuantityKg * ratio);
        }

        // Validate positive numbers for prices and quantities
        if (data.pricePerKg !== undefined && data.pricePerKg <= 0) {
            return NextResponse.json(
                { success: false, error: 'Price per kg must be greater than 0' },
                { status: 400 }
            );
        }

        if (data.totalQuantityKg !== undefined && data.totalQuantityKg <= 0) {
            return NextResponse.json(
                { success: false, error: 'Total quantity must be greater than 0' },
                { status: 400 }
            );
        }

        if (data.availableQuantityKg !== undefined && data.availableQuantityKg < 0) {
            return NextResponse.json(
                { success: false, error: 'Available quantity cannot be negative' },
                { status: 400 }
            );
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { ...data },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Product update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE - Delete an existing product
export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const productId = url.searchParams.get('id');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Optional: Check if product has any active reservations before deletion
        // You can uncomment this if you want to prevent deletion of products with reservations
        /*
        const activeReservations = await Reservation.countDocuments({ 
            productId: productId, 
            status: 'reserved' 
        });
        
        if (activeReservations > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Cannot delete product. It has ${activeReservations} active reservation(s).` 
                },
                { status: 400 }
            );
        }
        */

        // Delete the product
        const deletedProduct = await Product.findByIdAndDelete(productId);

        return NextResponse.json({
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Product deletion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}

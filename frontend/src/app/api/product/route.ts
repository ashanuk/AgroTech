import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/product';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const title = url.searchParams.get('title') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Search products with Atlas Search fuzzy matching
        const searchPipeline = [
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
            { $skip: skip },
            { $limit: limit },
        ];

        const products = await Product.aggregate(searchPipeline);

        // Count total matching documents using the same search query
        const countResults = await Product.aggregate([
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
            { $count: 'total' },
        ]);

        const total = countResults.length > 0 ? countResults[0].total : 0;

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

        // Validate required fields
        if (!data.title || !data.farmerId || !data.pricePerKg || !data.totalQuantityKg) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
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
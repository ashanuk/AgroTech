import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Reservation from '@/models/reservation';
import Product from '@/models/product';
import User from '@/models/user';
import mongoose from 'mongoose';

// Ensure all models are registered by referencing them
const ensureModelsRegistered = () => {
  // Force model registration if not already registered
  if (!mongoose.models.User) {
    User;
  }
  if (!mongoose.models.Product) {
    Product;
  }
  if (!mongoose.models.Reservation) {
    Reservation;
  }
};

// GET all reservations or search reservations by query parameters
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query object
    const query: any = {};
    
    if (buyerId) {
      query.buyerId = buyerId;
    }
    
    if (productId) {
      query.productId = productId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination and populate references with full product details
    const reservations = await Reservation.find(query)
      .populate('buyerId', 'name email phone role address')
      .populate({
        path: 'productId',
        select: 'title description cropType pricePerKg totalQuantityKg availableQuantityKg unit images address location farmerId createdAt updatedAt',
        populate: {
          path: 'farmerId',
          select: 'name email phone address'
        }
      })
      .sort({ reservedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination info
    const totalCount = await Reservation.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      status: 'success',
      data: reservations,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      message: `Found ${reservations.length} reservations`
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['buyerId', 'productId', 'quantityKg'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    // Validate quantity is positive
    if (body.quantityKg <= 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Quantity must be greater than 0'
        },
        { status: 400 }
      );
    }
    
    // Check if product exists and has sufficient quantity
    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Product not found'
        },
        { status: 404 }
      );
    }
    
    if (product.availableQuantityKg < body.quantityKg) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Insufficient quantity. Available: ${product.availableQuantityKg}kg, Requested: ${body.quantityKg}kg`
        },
        { status: 400 }
      );
    }
    
    // Create new reservation
    const newReservation = new Reservation({
      buyerId: body.buyerId,
      productId: body.productId,
      quantityKg: body.quantityKg,
      status: body.status || 'reserved'
    });
    
    const savedReservation = await newReservation.save();
    
    // Update product available quantity
    await Product.findByIdAndUpdate(
      body.productId,
      { $inc: { availableQuantityKg: -body.quantityKg } }
    );
    
    // Populate the saved reservation for response with full product details
    const populatedReservation = await Reservation.findById(savedReservation._id)
      .populate('buyerId', 'name email phone role')
      .populate({
        path: 'productId',
        select: 'title description cropType pricePerKg totalQuantityKg availableQuantityKg unit images location farmerId',
        populate: {
          path: 'farmerId',
          select: 'name email phone address'
        }
      })
      .lean();
    
    return NextResponse.json({
      status: 'success',
      data: populatedReservation,
      message: 'Reservation created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to create reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing reservation (mainly for status changes)
export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('id');
    
    if (!reservationId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Reservation ID is required'
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Get current reservation
    const currentReservation = await Reservation.findById(reservationId);
    if (!currentReservation) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Reservation not found'
        },
        { status: 404 }
      );
    }
    
    // Handle status changes that affect product quantity
    if (body.status && body.status !== currentReservation.status) {
      const product = await Product.findById(currentReservation.productId);
      
      if (body.status === 'cancelled' && currentReservation.status === 'reserved') {
        // Return quantity to product when cancelling
        await Product.findByIdAndUpdate(
          currentReservation.productId,
          { $inc: { availableQuantityKg: currentReservation.quantityKg } }
        );
      } else if (body.status === 'fulfilled' && currentReservation.status === 'reserved') {
        // Set fulfilled date when fulfilling
        body.fulfilledAt = new Date();
      } else if (body.status === 'reserved' && currentReservation.status === 'cancelled') {
        // Check if product has sufficient quantity when reactivating
        if (product && product.availableQuantityKg < currentReservation.quantityKg) {
          return NextResponse.json(
            {
              status: 'error',
              message: `Cannot reactivate reservation. Insufficient quantity available.`
            },
            { status: 400 }
          );
        }
        // Reserve quantity again
        await Product.findByIdAndUpdate(
          currentReservation.productId,
          { $inc: { availableQuantityKg: -currentReservation.quantityKg } }
        );
      }
    }
    
    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { ...body },
      { new: true, runValidators: true }
    ).populate('buyerId', 'name email phone role')
     .populate({
       path: 'productId',
       select: 'title description cropType pricePerKg totalQuantityKg availableQuantityKg unit images location farmerId',
       populate: {
         path: 'farmerId',
         select: 'name email phone address'
       }
     });
    
    return NextResponse.json({
      status: 'success',
      data: updatedReservation,
      message: 'Reservation updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to update reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a reservation
export async function DELETE(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('id');
    
    if (!reservationId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Reservation ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get reservation before deleting to restore product quantity if needed
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Reservation not found'
        },
        { status: 404 }
      );
    }
    
    // If reservation is still active, return quantity to product
    if (reservation.status === 'reserved') {
      await Product.findByIdAndUpdate(
        reservation.productId,
        { $inc: { availableQuantityKg: reservation.quantityKg } }
      );
    }
    
    // Delete the reservation
    const deletedReservation = await Reservation.findByIdAndDelete(reservationId);
    
    return NextResponse.json({
      status: 'success',
      data: deletedReservation,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to delete reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

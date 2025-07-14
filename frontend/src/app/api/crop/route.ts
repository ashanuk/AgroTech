import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Crop from '@/models/crop'
import mongoose from 'mongoose'

// GET all crops or search crops by query parameters
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase()
    
    // Get search parameters
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const type = searchParams.get('type')
    const search = searchParams.get('search') // General search term
    const exact = searchParams.get('exact') === 'true' // For exact name matching
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query object
    const query: any = {}
    
    // Handle name search
    if (name) {
      if (exact) {
        // Exact match for getting specific crop details by name
        query.name = { $regex: `^${name}$`, $options: 'i' }
      } else {
        // Partial match for search
        query.name = { $regex: name, $options: 'i' }
      }
    }
    
    // Handle type filter
    if (type) {
      query.type = { $regex: type, $options: 'i' }
    }
    
    // Handle general search (searches in name, type, description, scientificName)
    if (search && !name) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } }
      ]
    }
    
    // If exact name search, return single crop
    if (exact && name) {
      const crop = await Crop.findOne(query).lean()
      
      if (!crop) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Crop '${name}' not found`
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        status: 'success',
        data: crop,
        message: `Crop '${name}' found successfully`
      })
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit
    
    // Execute query with pagination
    const crops = await Crop.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination info
    const totalCount = await Crop.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      status: 'success',
      data: crops,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      message: `Found ${crops.length} crops`
    })
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch crops',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new crop
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'scientificName', 'suitability', 'plantingTime', 'harvestTime', 'waterRequirement', 'description', 'detailedInstructions']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }
    
    // Check if crop with same name already exists
    const existingCrop = await Crop.findOne({ name: { $regex: `^${body.name}$`, $options: 'i' } })
    if (existingCrop) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Crop with this name already exists'
        },
        { status: 409 }
      )
    }
    
    // Get the next ID
    const lastCrop = await Crop.findOne().sort({ id: -1 })
    const nextId = lastCrop ? lastCrop.id + 1 : 1
    
    // Create new crop
    const newCrop = new Crop({
      ...body,
      id: nextId
    })
    
    const savedCrop = await newCrop.save()
    
    return NextResponse.json({
      status: 'success',
      data: savedCrop,
      message: 'Crop created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating crop:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to create crop',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update an existing crop
export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const cropId = searchParams.get('id')
    
    if (!cropId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Crop ID is required'
        },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Update the crop
    const updatedCrop = await Crop.findOneAndUpdate(
      { id: parseInt(cropId) },
      { ...body },
      { new: true, runValidators: true }
    )
    
    if (!updatedCrop) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Crop not found'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: updatedCrop,
      message: 'Crop updated successfully'
    })
  } catch (error) {
    console.error('Error updating crop:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to update crop',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a crop
export async function DELETE(request: NextRequest) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const cropId = searchParams.get('id')
    
    if (!cropId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Crop ID is required'
        },
        { status: 400 }
      )
    }
    
    // Delete the crop
    const deletedCrop = await Crop.findOneAndDelete({ id: parseInt(cropId) })
    
    if (!deletedCrop) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Crop not found'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: deletedCrop,
      message: 'Crop deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting crop:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to delete crop',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

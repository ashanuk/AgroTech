import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Crop from '@/models/crop'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { cropNames } = await request.json()

    if (!cropNames || !Array.isArray(cropNames)) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'cropNames array is required' 
        },
        { status: 400 }
      )
    }

    console.log('🔍 Searching for crops by names:', cropNames)

    // Create flexible search patterns for each crop name
    const searchQueries = []
    
    for (const cropName of cropNames) {
      const cleanName = cropName.trim()
      // Add multiple search strategies for better matching
      searchQueries.push(
        // Exact match (case insensitive)
        { name: { $regex: `^${cleanName}$`, $options: 'i' } },
        { scientificName: { $regex: `^${cleanName}$`, $options: 'i' } },
        // Partial match (contains)
        { name: { $regex: cleanName, $options: 'i' } },
        { scientificName: { $regex: cleanName, $options: 'i' } },
        // First word match (for compound names)
        { name: { $regex: `^${cleanName.split(' ')[0]}`, $options: 'i' } }
      )
    }

    const crops = await Crop.find({
      $or: searchQueries
    }).lean()

    console.log(`📦 Found ${crops.length} crops from database`)
    
    if (crops.length > 0) {
      console.log('📋 Found crop names:', crops.map(c => c.name))
    }

    // Add default suitability for recommended crops if not present
    const cropsWithSuitability = crops.map(crop => ({
      ...crop,
      suitability: crop.suitability || 85 // Default suitability for recommended crops
    }))

    return NextResponse.json({
      status: 'success',
      data: cropsWithSuitability,
      pagination: {
        found: crops.length,
        requested: cropNames.length
      },
      message: `Found ${crops.length} crops matching the search criteria`,
      debug: {
        searchedFor: cropNames,
        foundNames: crops.map(c => c.name),
        totalMatches: crops.length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching crops by names:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch crops by names',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
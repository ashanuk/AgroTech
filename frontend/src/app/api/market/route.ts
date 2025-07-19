import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }
  return uri
}

export async function GET(request: NextRequest) {
  // First, try to use sample data without MongoDB for immediate functionality
  const sampleMarkets = [
    {
      _id: 'sample1',
      market: 'Pettah Market',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Tomatoes', unit: 'kg', price: 120 },
        { name: 'Onions', unit: 'kg', price: 180 },
        { name: 'Carrots', unit: 'kg', price: 150 },
        { name: 'Potatoes', unit: 'kg', price: 100 },
        { name: 'Cabbage', unit: 'kg', price: 80 }
      ]
    },
    {
      _id: 'sample2',
      market: 'Dambulla Economic Centre',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Rice (White)', unit: 'kg', price: 190 },
        { name: 'Rice (Red)', unit: 'kg', price: 210 },
        { name: 'Coconut', unit: 'piece', price: 45 },
        { name: 'Banana', unit: 'kg', price: 160 },
        { name: 'Pineapple', unit: 'piece', price: 200 }
      ]
    },
    {
      _id: 'sample3',
      market: 'Narahenpita Market',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Fish (Tuna)', unit: 'kg', price: 800 },
        { name: 'Fish (Mackerel)', unit: 'kg', price: 400 },
        { name: 'Prawns', unit: 'kg', price: 1200 },
        { name: 'Crab', unit: 'kg', price: 1500 },
        { name: 'Squid', unit: 'kg', price: 900 }
      ]
    },
    {
      _id: 'sample4',
      market: 'Kandy Market',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Green Beans', unit: 'kg', price: 200 },
        { name: 'Brinjal', unit: 'kg', price: 120 },
        { name: 'Okra', unit: 'kg', price: 180 },
        { name: 'Bitter Gourd', unit: 'kg', price: 140 },
        { name: 'Drumsticks', unit: 'kg', price: 220 }
      ]
    }
  ]

  try {
    console.log('📋 Using sample market data for immediate functionality')
    
    // Transform data for API response
    const transformedData = sampleMarkets.map(market => ({
      id: market._id.toString(),
      market: market.market,
      date: market.date,
      items: market.items || [],
      totalItems: market.items ? market.items.length : 0,
      averagePrice: market.items && market.items.length > 0 ? 
        Math.round(market.items.reduce((sum: number, item: any) => sum + item.price, 0) / market.items.length) : 0
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length,
      source: 'sample_data'
    })

  } catch (error) {
    console.error('Market API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET market summary/statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'summary') {
      console.log('📊 Generating market summary from sample data')
      
      // Use sample data for summary
      const sampleMarkets = [
        {
          market: 'Pettah Market',
          items: [
            { name: 'Tomatoes', unit: 'kg', price: 120 },
            { name: 'Onions', unit: 'kg', price: 180 },
            { name: 'Carrots', unit: 'kg', price: 150 },
            { name: 'Potatoes', unit: 'kg', price: 100 },
            { name: 'Cabbage', unit: 'kg', price: 80 }
          ]
        },
        {
          market: 'Dambulla Economic Centre',
          items: [
            { name: 'Rice (White)', unit: 'kg', price: 190 },
            { name: 'Rice (Red)', unit: 'kg', price: 210 },
            { name: 'Coconut', unit: 'piece', price: 45 },
            { name: 'Banana', unit: 'kg', price: 160 },
            { name: 'Pineapple', unit: 'piece', price: 200 }
          ]
        },
        {
          market: 'Narahenpita Market',
          items: [
            { name: 'Fish (Tuna)', unit: 'kg', price: 800 },
            { name: 'Fish (Mackerel)', unit: 'kg', price: 400 },
            { name: 'Prawns', unit: 'kg', price: 1200 },
            { name: 'Crab', unit: 'kg', price: 1500 },
            { name: 'Squid', unit: 'kg', price: 900 }
          ]
        },
        {
          market: 'Kandy Market',
          items: [
            { name: 'Green Beans', unit: 'kg', price: 200 },
            { name: 'Brinjal', unit: 'kg', price: 120 },
            { name: 'Okra', unit: 'kg', price: 180 },
            { name: 'Bitter Gourd', unit: 'kg', price: 140 },
            { name: 'Drumsticks', unit: 'kg', price: 220 }
          ]
        }
      ]
      
      const latestDate = new Date().toISOString().split('T')[0]
      
      // Calculate statistics
      const totalItems = sampleMarkets.reduce((sum, market) => sum + market.items.length, 0)
      const allPrices = sampleMarkets.flatMap(market => market.items.map((item: any) => item.price))
      const avgPrice = allPrices.length > 0 ? 
        Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length) : 0
      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
      const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0
      
      // Get unique product categories
      const allProducts = sampleMarkets.flatMap(market => market.items.map((item: any) => item.name))
      const uniqueProducts = [...new Set(allProducts)]
      
      return NextResponse.json({
        success: true,
        summary: {
          latestDate,
          totalMarkets: sampleMarkets.length,
          totalItems,
          totalProducts: uniqueProducts.length,
          priceRange: {
            min: minPrice,
            max: maxPrice,
            average: avgPrice
          },
          markets: sampleMarkets.map(market => ({
            name: market.market,
            itemCount: market.items.length,
            averagePrice: market.items.length > 0 ? 
              Math.round(market.items.reduce((sum: number, item: any) => sum + item.price, 0) / market.items.length) : 0
          }))
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Market API POST Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/db'
import Market from '../../../models/market'

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connectToDatabase()
    
    // Fetch market data from MongoDB
    const markets = await Market.find({}).sort({ date: -1 }).limit(50)
    // console.log(`📊 Found ${markets.length} market records`)
    // console.log('📅 Latest market dataaaaa:', markets)
    
    // Debug: Log the raw market data structure
    if (markets.length > 0) {
      console.log('🔍 First market raw data:', JSON.stringify(markets[0], null, 2))
      console.log('🔍 First market toObject():', markets[0].toObject())
      console.log('🔍 First market.market field:', markets[0].market)
      console.log('🔍 All available fields:', Object.keys(markets[0].toObject()))
    }
    
    if (markets.length === 0) {
      console.log('⚠️ No market data found in database')
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No market data available'
      })
    }

    // Transform data for API response based on your database structure
    const transformedData = markets.map(market => {
      const marketObj = market.toObject() // Convert to plain object first
      // console.log('🔍 Market data:', { 
      //   id: market._id, 
      //   market: marketObj.market, // Use toObject() version
      //   rawMarket: marketObj 
      // })
      
      return {
        id: market._id?.toString() || market.id,
        marketname: marketObj.market || 'Unknown Market', // Use marketObj.market
        date: marketObj.date instanceof Date ? marketObj.date.toISOString().split('T')[0] : marketObj.date,
        items: marketObj.items || [],
        totalItems: marketObj.items ? marketObj.items.length : 0,
        averagePrice: marketObj.items && marketObj.items.length > 0 ? 
          Math.round(marketObj.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0) / marketObj.items.length) : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length,
      source: 'database'
    })

  } catch (error) {
    console.error('❌ Market API Error:', error)
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
      console.log('📊 Generating market summary from database...')
      
      await connectToDatabase()
      const markets = await Market.find({}).sort({ date: -1 }).limit(100)
      
      if (markets.length === 0) {
        return NextResponse.json({
          success: true,
          summary: {
            latestDate: new Date().toISOString().split('T')[0],
            totalMarkets: 0,
            totalItems: 0,
            totalProducts: 0,
            priceRange: { min: 0, max: 0, average: 0 },
            markets: []
          }
        })
      }
      
      const latestDate = markets[0]?.date instanceof Date ? 
        markets[0].date.toISOString().split('T')[0] : 
        markets[0]?.date || new Date().toISOString().split('T')[0]
      
      // Calculate statistics from real database data
      const totalItems = markets.reduce((sum, market) => sum + (market.items?.length || 0), 0)
      const allPrices = markets.flatMap(market => 
        (market.items || []).map(item => item.price || 0).filter(price => price > 0)
      )
      const avgPrice = allPrices.length > 0 ? 
        Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length) : 0
      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
      const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0
      
      // Get unique product names
      const allProducts = markets.flatMap(market => 
        (market.items || []).map(item => item.name).filter(name => name)
      )
      const uniqueProducts = [...new Set(allProducts)]
      
      return NextResponse.json({
        success: true,
        summary: {
          latestDate,
          totalMarkets: markets.length,
          totalItems,
          totalProducts: uniqueProducts.length,
          priceRange: {
            min: minPrice,
            max: maxPrice,
            average: avgPrice
          },
          markets: markets.slice(0, 10).map(market => {
            const marketObj = market.toObject()
            return {
              name: marketObj.market || 'Unknown Market',
              itemCount: marketObj.items?.length || 0,
              averagePrice: marketObj.items && marketObj.items.length > 0 ? 
                Math.round(marketObj.items.reduce((sum, item) => sum + (item.price || 0), 0) / marketObj.items.length) : 0
            }
          })
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Market API POST Error:', error)
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

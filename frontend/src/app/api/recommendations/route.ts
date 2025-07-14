import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔄 Proxying recommendation request:', body)
    
    // Forward the request to your ML API
    const response = await fetch('http://localhost:8000/crop-recommendation/suitable-crops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 ML API Response status:', response.status)
    console.log('📡 ML API Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ML API Error:', errorText)
      throw new Error(`ML API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Raw ML API response:', data)

    // Transform the response to a consistent format
    let transformedResponse

    if (Array.isArray(data)) {
      // If it's an array of crop recommendations
      const cropNames = data.map((item: any) => item.crop || item.name).filter(Boolean)
      transformedResponse = {
        success: true,
        status: 'success',
        recommended_crops: cropNames,
        raw_data: data,
        probabilities: data.map((item: any) => ({
          crop: item.crop || item.name,
          probability: item.probability || item.confidence || 1.0
        })),
        message: `Found ${cropNames.length} crop recommendations`
      }
    } else if (data.crop) {
      // If it's a single crop recommendation
      transformedResponse = {
        success: true,
        status: 'success',
        recommended_crops: [data.crop],
        raw_data: data,
        probabilities: [{
          crop: data.crop,
          probability: data.probability || 1.0
        }],
        message: 'Found 1 crop recommendation'
      }
    } else {
      // Return the original format with added success flag
      transformedResponse = {
        ...data,
        success: true,
        status: 'success'
      }
    }

    console.log('✅ Transformed response:', transformedResponse)
    return NextResponse.json(transformedResponse)

  } catch (error) {
    console.error('❌ Proxy error:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            success: false,
            status: 'error',
            error: 'ML API server is not available',
            message: 'Please make sure the ML API server is running on http://localhost:8000'
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false,
        status: 'error',
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
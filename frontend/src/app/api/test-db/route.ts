import { NextResponse } from 'next/server'
import client from '@/lib/db'

export async function GET() {
  try {
    // Connect to MongoDB
    await client.connect()
    const db = client.db('agrotech')
    
    // Test the connection
    await db.admin().ping()
    
    // Get database stats
    const stats = await db.stats()
    
    // List collections
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      status: 'Connected',
      database: db.databaseName,
      collections: stats.collections,
      dataSize: stats.dataSize,
      collectionNames: collections.map(col => col.name),
      message: 'MongoDB connection is working!'
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      { 
        status: 'Error',
        message: 'Failed to connect to MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
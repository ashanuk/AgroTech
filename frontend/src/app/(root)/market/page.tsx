"use client"

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShoppingCart, 
  Building2,
  Filter,
  SortAsc,
  SortDesc,
  Navigation,
  Loader2,
  Star,
  Eye,
  Phone,
  Plus,
  Minus,
  Package
} from 'lucide-react'
import { GET_PRODUCTS, SEARCH_PRODUCTS, GET_NEARBY_PRODUCTS, CREATE_RESERVATION_MUTATION } from '@/lib/graphql/queries'
import { useIsClient, useGeolocation, useSafeDate } from '@/hooks/useClientSafe'

// Types for real market data from database
interface MarketItem {
  name: string
  unit: string
  price: number
}

interface RealMarketData {
  id: string
  marketname: string
  date: string
  items: MarketItem[]
  totalItems: number
  averagePrice: number
}

interface MarketSummary {
  latestDate: string
  totalMarkets: number
  totalItems: number
  totalProducts: number
  priceRange: {
    min: number
    max: number
    average: number
  }
  markets: Array<{
    name: string
    itemCount: number
    averagePrice: number
  }>
}

// Types for market data - Update to match GraphQL Product type
interface Product {
  id: string
  title: string
  description: string
  cropType: string
  pricePerKg: number
  totalQuantityKg: number
  availableQuantityKg: number
  unit: string
  images: string[]
  location?: {
    type: string
    coordinates: [number, number]
  }
  address?: string
  createdAt: string
  updatedAt: string
  farmer: {
    id: string
    name: string
    username?: string
    email: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface MarketPrice {
  id: string
  product: string
  category: string
  price: number
  unit: string
  currency: string
  location: string
  district: string
  market: string
  date: string
  trend: 'up' | 'down' | 'stable'
  quality: 'premium' | 'standard' | 'economy'
  availability: 'high' | 'medium' | 'low'
  distance?: number // in km from user location
  lastUpdated: string
}

interface Market {
  id: string
  name: string
  location: string
  district: string
  type: 'wholesale' | 'retail' | 'farmers'
  description: string
  image: string
  productsCount: number
  rating: number
  openHours: string
  contact: string
  coordinates: {
    lat: number
    lng: number
  }
}

// API functions for market data
const fetchMarketData = async (market?: string, date?: string): Promise<RealMarketData[]> => {
  try {
    const params = new URLSearchParams()
    if (market) params.append('market', market)
    if (date) params.append('date', date)
    
    const url = `/api/market?${params.toString()}`
    // console.log('🔗 Fetching from URL:', url)
    
    const response = await fetch(url)
    console.log('📡 Response status:', response.status)
    
    const data = await response.json()
    // console.log('📄 Response data:', data)
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.message || 'Failed to fetch market data')
    }
  } catch (error) {
    console.error('❌ Error fetching market data:', error)
    return []
  }
}

const fetchMarketSummary = async (): Promise<MarketSummary | null> => {
  try {
    console.log('📊 Fetching market summary...')
    const response = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'summary' })
    })
    
    console.log('📊 Summary response status:', response.status)
    const data = await response.json()
    // console.log('📊 Summary response data:', data)
    
    if (data.success) {
      return data.summary
    } else {
      throw new Error(data.message || 'Failed to fetch market summary')
    }
  } catch (error) {
    console.error('❌ Error fetching market summary:', error)
    return null
  }
}

export default function MarketPage() {
  const [selectedMarket, setSelectedMarket] = useState<RealMarketData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Real market data states
  const [realMarketData, setRealMarketData] = useState<RealMarketData[]>([])
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null)
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true)
  const [marketError, setMarketError] = useState<string | null>(null)
  
  // Reservation states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isReservationSheetOpen, setIsReservationSheetOpen] = useState(false)
  const [reservationQuantity, setReservationQuantity] = useState<number>(1)
  const [isReserving, setIsReserving] = useState(false)

  // GraphQL Queries
  const { 
    loading: productsLoading, 
    error: productsError, 
    data: productsData 
  } = useQuery(GET_PRODUCTS, {
    variables: { limit: 50, offset: 0 }
  })

  const { 
    loading: searchLoading, 
    error: searchError, 
    data: searchData,
    refetch: refetchSearch 
  } = useQuery(SEARCH_PRODUCTS, {
    variables: { query: searchQuery, limit: 20, offset: 0 },
    skip: !searchQuery || searchQuery.length < 1
  })

  // Reservation mutation
  const [createReservation] = useMutation(CREATE_RESERVATION_MUTATION, {
    onCompleted: (data) => {
      // console.log('Reservation created:', data.createReservation)
      setIsReservationSheetOpen(false)
      setReservationQuantity(1)
      setSelectedProduct(null)
      // Refetch products to update available quantities
      if (isSearching) {
        refetchSearch()
      }
    },
    onError: (error) => {
      console.error('Reservation error:', error)
      alert(`Error creating reservation: ${error.message}`)
    }
  })

  // Hydration fix: Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get user location for nearby products - only run on client
  useEffect(() => {
    if (!isClient) return

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
          // Set default location (Colombo, Sri Lanka)
          setUserLocation({ lat: 6.9271, lng: 79.8612 })
        }
      )
    } else {
      // Fallback to Colombo
      setUserLocation({ lat: 6.9271, lng: 79.8612 })
    }
  }, [isClient])

  // Fetch real market data from database
  useEffect(() => {
    const loadMarketData = async () => {
      console.log('🔄 Loading market data...')
      setIsLoadingMarkets(true)
      setMarketError(null)
      
      try {
        // Fetch both market data and summary
        console.log('📡 Fetching market data from API...')
        const [marketData, summary] = await Promise.all([
          fetchMarketData(),
          fetchMarketSummary()
        ])
        
        // console.log('✅ Market data received:', marketData)
        // console.log('📊 Market summary received:', summary)
        
        setRealMarketData(marketData)
        setMarketSummary(summary)
      } catch (error) {
        console.error('❌ Error loading market data:', error)
        setMarketError(error instanceof Error ? error.message : 'Failed to load market data')
      } finally {
        setIsLoadingMarkets(false)
        console.log('🏁 Market data loading finished')
      }
    }
    
    loadMarketData()
  }, [])

  // Convert products to market price format for display
  const convertProductsToMarketPrices = (products: Product[]): MarketPrice[] => {
    return products.map(product => {
      // Safe date formatting to prevent hydration issues
      let formattedDate = ''
      let timeAgo = ''
      
      if (isClient) {
        try {
          formattedDate = new Date(product.createdAt).toISOString().split('T')[0]
          timeAgo = getTimeAgo(product.updatedAt)
        } catch (error) {
          formattedDate = ''
          timeAgo = ''
        }
      }

      return {
        id: product.id,
        product: product.title,
        category: product.cropType,
        price: product.pricePerKg,
        unit: product.unit,
        currency: 'LKR',
        location: product.address || 'Sri Lanka',
        district: extractDistrict(product.address || ''),
        market: `${product.farmer?.name || 'Farm'}'s Farm`,
        date: formattedDate,
        trend: 'stable' as const,
        quality: determineQuality(product.pricePerKg),
        availability: determineAvailability(product.availableQuantityKg, product.totalQuantityKg),
        distance: product.location && userLocation ? 
          calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            product.location.coordinates[1], 
            product.location.coordinates[0]
          ) : undefined,
        lastUpdated: timeAgo
      }
    })
  }

  // Helper functions
  const extractDistrict = (address: string): string => {
    const districts = ['Colombo', 'Gampaha', 'Kandy', 'Matale', 'Galle', 'Jaffna', 'Kurunegala', 'Anuradhapura']
    const found = districts.find(district => address.includes(district))
    return found || 'Other'
  }

  const determineQuality = (price: number): 'premium' | 'standard' | 'economy' => {
    if (price > 200) return 'premium'
    if (price > 100) return 'standard'
    return 'economy'
  }

  const determineAvailability = (available: number, total: number): 'high' | 'medium' | 'low' => {
    const ratio = available / total
    if (ratio > 0.7) return 'high'
    if (ratio > 0.3) return 'medium'
    return 'low'
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }

  const getTimeAgo = (dateString: string): string => {
    // Prevent hydration issues by avoiding time calculations during SSR
    if (!isClient) return ''
    
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Less than an hour ago'
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } catch (error) {
      return ''
    }
  }

  // Get products data
  const allProducts = productsData?.products || []
  const searchResults = searchData?.searchProducts || []
  
  // Convert to market price format
  const allMarketPrices = convertProductsToMarketPrices(allProducts)
  const searchMarketPrices = convertProductsToMarketPrices(searchResults)

  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(allMarketPrices.map(p => p.category)))]

  // Handle market card click
  const handleMarketClick = (market: RealMarketData) => {
    setSelectedMarket(market)
    // Convert market items to market price format for display
    const marketPrices: MarketPrice[] = market.items.map((item, index) => ({
      id: `${market.id}-${index}`,
      product: item.name,
      category: 'Vegetables', // Default category - could be enhanced
      price: item.price,
      unit: item.unit,
      currency: 'LKR',
      location: `${market.marketname}, Sri Lanka`,
      district: market.marketname,
      market: market.marketname,
      date: market.date,
      trend: 'stable' as const,
      quality: item.price > 200 ? 'premium' : item.price > 100 ? 'standard' : 'economy',
      availability: 'high' as const,
      distance: 0, // Could be calculated if user location is available
      lastUpdated: `Updated: ${market.date}`
    }))
    
    setMarketPrices(marketPrices)
    setIsSheetOpen(true)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(query.length > 0)
    
    if (query.trim() === "") {
      return
    }

    // Refetch search results when query changes - now triggers on single character
    if (query.length >= 1) {
      refetchSearch({ query, limit: 20, offset: 0 })
    }
  }

  // Handle reservation
  const handleReserveProduct = (product: Product) => {
    setSelectedProduct(product)
    setReservationQuantity(1)
    setIsReservationSheetOpen(true)
  }

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      if (selectedProduct && reservationQuantity < selectedProduct.availableQuantityKg) {
        setReservationQuantity(prev => prev + 1)
      }
    } else {
      if (reservationQuantity > 1) {
        setReservationQuantity(prev => prev - 1)
      }
    }
  }

  const handleCreateReservation = async () => {
    if (!selectedProduct) return
    
    setIsReserving(true)
    try {
      await createReservation({
        variables: {
          input: {
            productId: selectedProduct.id,
            quantityKg: reservationQuantity
          }
        }
      })
    } catch (error) {
      console.error('Error creating reservation:', error)
    } finally {
      setIsReserving(false)
    }
  }

  // Get filtered and sorted search results
  const getFilteredResults = () => {
    let results = [...searchMarketPrices]
    
    // Apply category filter
    if (filterCategory !== 'all') {
      results = results.filter(price => price.category === filterCategory)
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'price') {
        comparison = a.price - b.price
      } else if (sortBy === 'distance') {
        comparison = (a.distance || 0) - (b.distance || 0)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return results
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />
    }
  }

  const getQualityBadge = (quality: string) => {
    const variants = {
      premium: 'default',
      standard: 'secondary',
      economy: 'outline'
    } as const
    
    return variants[quality as keyof typeof variants] || 'secondary'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sri Lankan Markets</h1>
          <p className="text-muted-foreground">Find the best prices for agricultural products across the island</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Building2 className="w-4 h-4 mr-1" />
          Live Prices
        </Badge>
      </div>

      {/* Markets Grid - Always show */}
      <div>
        <h2 className="text-2xl font-semibold">Major Markets</h2>
        
       
        
        {isLoadingMarkets && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading market data...</span>
          </div>
        )}
        
        {marketError && (
          <div className="text-red-500 py-4">
            Error loading market data: {marketError}
          </div>
        )}
        
        {!isLoadingMarkets && !marketError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {realMarketData.map((market) => {
              // Get market icon based on market name
              const getMarketIcon = (marketName: string) => {
                if (marketName.toLowerCase().includes('pettah')) return '🏪'
                if (marketName.toLowerCase().includes('dambulla')) return '🌽'
                if (marketName.toLowerCase().includes('narahenpita')) return '🥬'
                return '🛒'
              }

              return (
                <Card 
                  key={market.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleMarketClick(market)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getMarketIcon(market.marketname)}</span>
                      <div>
                        <CardTitle className="text-lg">{market.marketname} Market</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            wholesale
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">LKR {market.averagePrice} avg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Fresh produce market with {market.totalItems} items available
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{market.marketname}, Sri Lanka</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Updated: {market.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span>{market.totalItems} live products</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
          <CardDescription>
            Search for product prices across all markets in Sri Lanka
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products (e.g., Tomato, Rice, Fish)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Controls */}
          {isSearching && (
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'price' | 'distance') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isSearching && (
        <div>
          {searchLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Searching products...</span>
            </div>
          )}
          
          {searchError && (
            <div className="text-red-500 py-4">
              Error searching products: {searchError.message}
            </div>
          )}
          
          {!searchLoading && !searchError && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Search Results for "{searchQuery}"
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  ({getFilteredResults().length} found)
                </span>
              </h2>
              
              {getFilteredResults().length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords or check your spelling.
                  </p>
                </div>
              ) : (
                /* Group results by product */
                Object.entries(
                  getFilteredResults().reduce((groups: Record<string, MarketPrice[]>, price) => {
                    if (!groups[price.product]) {
                      groups[price.product] = []
                    }
                    groups[price.product].push(price)
                    return groups
                  }, {})
                ).map(([product, prices]: [string, MarketPrice[]]) => (
                  <div key={product} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {product}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({prices.length} farm{prices.length > 1 ? 's' : ''})
                      </span>
                    </h3>
                    
                    {/* Grid Header */}
                    <div className="bg-muted/50 rounded-t-lg p-4 border">
                      <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground">
                        <div>Farmer/Market</div>
                        <div>Price</div>
                        <div>Quality</div>
                        <div>Location</div>
                        <div>Distance</div>
                        <div>Status</div>
                        <div>Action</div>
                      </div>
                    </div>
                    
                    {/* Grid Rows */}
                    <div className="border border-t-0 rounded-b-lg">
                      {prices.map((price, index) => {
                        // Find the corresponding product data
                        const productData: Product | undefined = searchResults.find((p: Product) => p.id === price.id)
                        
                        return (
                          <div 
                            key={price.id} 
                            className={`grid grid-cols-7 gap-4 p-4 hover:bg-muted/30 transition-colors ${
                              index !== prices.length - 1 ? 'border-b' : ''
                            }`}
                          >
                            {/* Market */}
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{price.market}</span>
                              {getTrendIcon(price.trend)}
                            </div>
                            
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">
                                {price.currency} {price.price}
                              </span>
                              <span className="text-xs text-muted-foreground">per {price.unit}</span>
                            </div>
                            
                            {/* Quality */}
                            <div>
                              <Badge variant={getQualityBadge(price.quality)} className="text-xs">
                                {price.quality}
                              </Badge>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{price.location}</span>
                            </div>
                            
                            {/* Distance */}
                            <div className="flex items-center gap-1 text-sm">
                              <Navigation className={`h-3 w-3 ${price.distance && price.distance <= 10 ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={price.distance && price.distance <= 10 ? 'text-green-600 font-medium' : ''}>
                                {price.distance ? `${price.distance} km` : 'N/A'}
                              </span>
                            </div>
                            
                            {/* Status */}
                            <div className="space-y-1">
                              <div className={`text-xs ${getAvailabilityColor(price.availability)}`}>
                                {price.availability} availability
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {price.lastUpdated}
                              </div>
                            </div>
                            
                            {/* Action - Reserve Button */}
                            <div className="flex items-center">
                              {productData ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleReserveProduct(productData)}
                                  disabled={!productData.availableQuantityKg || productData.availableQuantityKg === 0}
                                  className="h-8 px-3"
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Reserve
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Market Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[450px] sm:w-[600px] p-0 sm:max-w-[580px] rounded-l-sm flex flex-col">
          {selectedMarket && (
            <>
              <SheetHeader className="space-y-3 p-6 pb-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {selectedMarket.marketname.toLowerCase().includes('pettah') ? '🏪' : 
                     selectedMarket.marketname.toLowerCase().includes('dambulla') ? '🌽' : 
                     selectedMarket.marketname.toLowerCase().includes('narahenpita') ? '🥬' : '🛒'}
                  </span>
                  <div>
                    <SheetTitle className="text-2xl">{selectedMarket.marketname} Market</SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        wholesale market
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">LKR {selectedMarket.averagePrice} avg</span>
                      </div>
                    </div>
                  </div>
                </div>
                <SheetDescription className="text-base">
                  Fresh produce market with {selectedMarket.totalItems} items available. Updated on {selectedMarket.date}.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <div className="space-y-6 py-6">
                  {/* Market Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Market Information</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">Location</div>
                          <div className="text-sm text-muted-foreground">{selectedMarket.marketname}, Sri Lanka</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">Last Updated</div>
                          <div className="text-sm text-muted-foreground">{selectedMarket.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">Available Products</div>
                          <div className="text-sm text-muted-foreground">{selectedMarket.totalItems} items</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Current Prices */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Current Prices</h3>
                    <div className="space-y-3">
                      {marketPrices.length > 0 ? (
                        marketPrices.map((price) => (
                          <Card key={price.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{price.product}</h4>
                                <Badge variant={getQualityBadge(price.quality)} className="text-xs">
                                  {price.quality}
                                </Badge>
                              </div>
                              {getTrendIcon(price.trend)}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">
                                {price.currency} {price.price}
                              </span>
                              <span className="text-sm text-muted-foreground">per {price.unit}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 text-sm">
                              <span className={getAvailabilityColor(price.availability)}>
                                {price.availability} availability
                              </span>
                              <span className="text-muted-foreground">
                                Updated {price.lastUpdated}
                              </span>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No price data available for this market</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Add bottom padding */}
                  <div className="h-20"></div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Market Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {marketSummary ? (
              <>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{marketSummary.totalItems} products available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{marketSummary.totalMarkets} active markets</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{marketSummary.totalProducts} unique products</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading market data...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Price Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketSummary ? (
                <>
                  <div className="text-sm">
                    <span className="font-medium">Avg Price: </span>
                    LKR {marketSummary.priceRange.average}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Price Range: </span>
                    LKR {marketSummary.priceRange.min} - {marketSummary.priceRange.max}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated: {marketSummary.latestDate}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading price data...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                // Find lowest price product
                if (allMarketPrices.length > 0) {
                  const cheapest = allMarketPrices.reduce((min, p) => p.price < min.price ? p : min)
                  setSearchQuery(cheapest.product)
                  setIsSearching(true)
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Find Best Deals
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                if (userLocation) {
                  // Sort by distance and search for nearest
                  const nearest = allMarketPrices
                    .filter(p => p.distance)
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0]
                  if (nearest) {
                    setSearchQuery(nearest.product)
                    setIsSearching(true)
                  }
                }
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Find Nearest Products
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reservation Sheet */}
      <Sheet open={isReservationSheetOpen} onOpenChange={setIsReservationSheetOpen}>
        <SheetContent className="w-[450px] sm:w-[500px] sm:max-w-[480px] rounded-l-sm h-full overflow-hidden flex flex-col">
          {selectedProduct && (
            <>
              <SheetHeader className="space-y-3 p-6 pb-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <SheetTitle className="text-xl">Reserve Product</SheetTitle>
                    <SheetDescription className="text-sm">
                      Reserve {selectedProduct.title} from {selectedProduct.farmer?.name || 'farmer'}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-6 py-6">
                  {/* Product Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{selectedProduct.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {selectedProduct.cropType}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {selectedProduct.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Price per kg:</span>
                            <div className="text-lg font-bold text-primary">
                              LKR {selectedProduct.pricePerKg}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Available:</span>
                            <div className="text-lg font-semibold">
                              {selectedProduct.availableQuantityKg} kg
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Farmer:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span>{selectedProduct.farmer?.name || selectedProduct.farmer?.username}</span>
                            {selectedProduct.farmer?.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {selectedProduct.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProduct.address}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Reservation Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Reservation Details</h3>
                    <div className="space-y-4">
                      {/* Quantity Selector */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Quantity (kg)
                        </label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(false)}
                            disabled={reservationQuantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex-1 text-center">
                            <Input
                              type="number"
                              value={reservationQuantity}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                if (value >= 1 && value <= selectedProduct.availableQuantityKg) {
                                  setReservationQuantity(value)
                                }
                              }}
                              min="1"
                              max={selectedProduct.availableQuantityKg}
                              step="0.1"
                              className="text-center"
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(true)}
                            disabled={reservationQuantity >= selectedProduct.availableQuantityKg}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum available: {selectedProduct.availableQuantityKg} kg
                        </p>
                      </div>

                      {/* Price Summary */}
                      <Card className="p-4 bg-muted/50">
                        <h4 className="font-medium mb-3">Price Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Unit Price:</span>
                            <span>LKR {selectedProduct.pricePerKg} per kg</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Quantity:</span>
                            <span>{reservationQuantity} kg</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-primary">
                              LKR {(selectedProduct.pricePerKg * reservationQuantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>

                      {/* Reserve Button */}
                      <Button
                        onClick={handleCreateReservation}
                        disabled={isReserving || reservationQuantity <= 0 || reservationQuantity > selectedProduct.availableQuantityKg}
                        className="w-full"
                        size="lg"
                      >
                        {isReserving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Reservation...
                          </>
                        ) : (
                          <>
                            <Package className="h-4 w-4 mr-2" />
                            Reserve for LKR {(selectedProduct.pricePerKg * reservationQuantity).toFixed(2)}
                          </>
                        )}
                      </Button>
                      
                      {/* Additional bottom padding for better scroll experience */}
                      <div className="h-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
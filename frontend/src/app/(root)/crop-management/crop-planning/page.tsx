"use client"

import React, { useState, useEffect } from 'react'
import { Search, Cloud, Sun, CloudRain, Filter, Leaf, Wheat, TreePine, ChevronRight, Calendar, Droplets, Thermometer, Clock, MapPin, Loader2, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Interfaces for our data
interface ICrop {
  _id?: string;
  id: number;
  name: string;
  type: string;
  scientificName: string;
  suitability: number;
  plantingTime: string;
  harvestTime: any;
  waterRequirement: string;
  temperatureRange?: {
    min: number;
    max: number;
  };
  phRange?: {
    min: number;
    max: number;
  };
  image?: string;
  description: string;
  detailedInstructions: any;
}

const weatherConditions = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain }
]

const filterOptions = [
  { value: "all", label: "All Crops", icon: Leaf },
  { value: "vegetable", label: "Vegetables", icon: Leaf },
  { value: "grain", label: "Grains", icon: Wheat }
]

export default function CropPlanningPage() {
  const [location, setLocation] = useState("")
  const [temperature, setTemperature] = useState("")
  const [weather, setWeather] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedCrop, setSelectedCrop] = useState<ICrop | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // New states for API integration
  const [crops, setCrops] = useState<ICrop[]>([])
  const [allCrops, setAllCrops] = useState<ICrop[]>([]) // Store all crops for search
  const [isLoading, setIsLoading] = useState(false)
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all crops on component mount
  useEffect(() => {
    fetchAllCrops()
  }, [])

  const fetchAllCrops = async () => {
    try {
      setIsLoading(true)
      setError(null) // Clear any previous errors
      
      console.log('🔄 Starting to fetch crops...')
      const response = await fetch('/api/crop') // Change from '/api/crop' to '/api/crops'
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Raw API Response:', data)
      
      // Check for 'status' instead of 'success'
      if (data.status === 'success' && Array.isArray(data.data)) {
        console.log('✅ Setting crops:', data.data.length, 'items')
        
        // Helper function to get random crops (client-side only)
        const getRandomCrops = (cropsArray: ICrop[], count: number = 10): ICrop[] => {
          // Use a deterministic selection for SSR, random for client
          if (typeof window === 'undefined') {
            return cropsArray.slice(0, count)
          }
          const shuffled = [...cropsArray].sort(() => 0.5 - Math.random())
          return shuffled.slice(0, count)
        }
        
        const randomCrops = getRandomCrops(data.data, 10)
        console.log('🎲 Selected random crops:', randomCrops.length, 'items')
        
        setCrops(randomCrops) // Set random 10 crops for display
        setAllCrops(data.data) // Store all crops for search functionality
        
        // Log first crop for structure inspection
        if (randomCrops.length > 0) {
          console.log('📋 Sample crop structure:', randomCrops[0])
        }
      } else {
        console.error('❌ API Response structure issue:', {
          status: data.status,
          dataType: typeof data.data,
          isArray: Array.isArray(data.data),
          dataLength: data.data?.length,
          fullResponse: data
        })
        setError(`Invalid API response structure. Status: ${data.status}, Data type: ${typeof data.data}`)
      }
    } catch (error) {
      console.error('❌ Fetch error details:', error)
      if (error instanceof Error) {
        console.error('❌ Error name:', error.name)
        console.error('❌ Error message:', error.message)
        setError(`Failed to fetch crops: ${error.message}`)
      } else {
        setError('Failed to fetch crops: Unknown error')
      }
    } finally {
      setIsLoading(false)
      console.log('🏁 Fetch operation completed')
    }
  }

  const getCropRecommendations = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setIsRecommendationLoading(true)
    setError(null)

    try {
      // Step 1: Get crop recommendations from ML API via proxy
      console.log('🔍 Getting recommendations for:', location)
      
      const recommendationResponse = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: `${location.trim()}, Sri Lanka`,
          use_defaults: true
        }),
      })

      if (!recommendationResponse.ok) {
        throw new Error(`Recommendation API error: ${recommendationResponse.status}`)
      }

      const recommendationData = await recommendationResponse.json()
      console.log('📋 Recommended crops from ML API:', recommendationData)

      // Handle the actual ML API response format
      let cropNames: string[] = []
      
      if (Array.isArray(recommendationData)) {
        // If it's an array of objects with 'crop' field
        cropNames = recommendationData.map((item: any) => item.crop).filter(Boolean)
        console.log('🎯 Extracted crop names from array:', cropNames)
      } else if (recommendationData.success && recommendationData.recommended_crops) {
        // If it's the expected format
        cropNames = recommendationData.recommended_crops
        console.log('🎯 Crop names from success response:', cropNames)
      } else if (recommendationData.crop) {
        // If it's a single crop recommendation
        cropNames = [recommendationData.crop]
        console.log('🎯 Single crop recommendation:', cropNames)
      } else {
        console.error('❌ Unexpected ML API response format:', recommendationData)
        throw new Error('No valid crop recommendations received from ML API')
      }

      if (cropNames.length === 0) {
        throw new Error('No crop recommendations found in ML API response')
      }

      console.log('🎯 Final crop names to search for:', cropNames)

      // Step 2: Get crop details from database using the new API endpoint
      console.log('📊 Fetching crop details from database...')
      const detailsResponse = await fetch('/api/crop/by-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cropNames: cropNames }),
      })

      if (!detailsResponse.ok) {
        throw new Error(`Database API error: ${detailsResponse.status}`)
      }

      const detailsData = await detailsResponse.json()
      console.log('✅ Crop details response:', detailsData)
      console.log('📊 Found crop details:', detailsData.data?.length || 0)

      // Handle the response format from your existing API
      if (detailsData.status === 'success' && detailsData.data && detailsData.data.length > 0) {
        console.log('✅ Setting recommended crops:', detailsData.data.length)
        setCrops(detailsData.data)
        setSearchPerformed(true)
        setSearchQuery("") // Clear search when getting recommendations
        setError(null) // Clear any previous errors
      } else {
        console.warn('⚠️ No matching crops found in database')
        console.log('🔍 Requested crops:', cropNames)
        console.log('📋 Database response:', detailsData)
        
        // Show a more helpful error message
        setError(`Found recommendations but couldn't match them in our database. Recommended crops: ${cropNames.join(', ')}`)
        
        // Optionally, show all crops as fallback
        setCrops(allCrops)
        setSearchPerformed(false)
      }

    } catch (error) {
      console.error('Error in crop recommendation:', error)
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to get crop recommendations. Please try again.'
      )
    } finally {
      setIsRecommendationLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    console.log('🔍 Search called with query:', query)
    console.log('📊 allCrops length:', allCrops.length)
    
    setSearchQuery(query)
    setIsSearching(query.length > 0)
    
    if (query.trim() === "") {
      console.log('🔄 Clearing search, showing all crops')
      setCrops(allCrops)
      setSearchPerformed(false)
      return
    }

    // Filter crops based on search query with null checks
    const searchResults = allCrops.filter(crop => {
      const searchTerm = query.toLowerCase()
      
      // Safely check each field with null/undefined protection
      const nameMatch = crop.name?.toLowerCase().includes(searchTerm) || false
      const scientificNameMatch = crop.scientificName?.toLowerCase().includes(searchTerm) || false
      const descriptionMatch = crop.description?.toLowerCase().includes(searchTerm) || false
      const typeMatch = crop.type?.toLowerCase().includes(searchTerm) || false
      
      return nameMatch || scientificNameMatch || descriptionMatch || typeMatch
    })
    
    console.log('🎯 Search results:', searchResults.length, 'crops found')
    console.log('📋 Found crops:', searchResults.map(c => c.name))
    
    // Set the filtered results to crops state
    setCrops(searchResults)
    setSearchPerformed(false) // Reset recommendation state when searching
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
    setCrops(allCrops) // Show all crops
    setSearchPerformed(false)
  }

  const showAllCrops = () => {
    setSearchQuery("")
    setIsSearching(false)
    setCrops(allCrops) // Show all crops
    setSearchPerformed(false)
  }

  // Update the filteredCrops to apply type filter on the current crops state
  const filteredCrops = crops.filter(crop => 
    filter === "all" || crop.type.toLowerCase() === filter.toLowerCase()
  ).sort((a, b) => b.suitability - a.suitability)

  const handleCropSelect = (crop: ICrop) => {
    setSelectedCrop(crop)
    setIsDrawerOpen(true)
  }

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 90) return "text-chart-2"
    if (suitability >= 80) return "text-chart-4"
    if (suitability >= 70) return "text-chart-1"
    return "text-muted-foreground"
  }

  const getSuitabilityBadge = (suitability: number) => {
    if (suitability >= 90) return "default"
    if (suitability >= 80) return "secondary"
    return "outline"
  }

  const getHarvestTimeDisplay = (harvestTime: any): string => {
    if (typeof harvestTime === 'string') {
      return harvestTime;
    }
    if (typeof harvestTime === 'object' && harvestTime !== null) {
      if (harvestTime.duration) return harvestTime.duration;
      if (harvestTime.time) return harvestTime.time;
      if (harvestTime.period) return harvestTime.period;
      if (harvestTime.days) return `${harvestTime.days} days`;
      if (harvestTime.months) return `${harvestTime.months} months`;
    }
    return 'Variable timing';
  }

  const getTemperatureDisplay = (crop: ICrop): string => {
    if (crop.temperatureRange?.min !== undefined && crop.temperatureRange?.max !== undefined) {
      return `${crop.temperatureRange.min}°C - ${crop.temperatureRange.max}°C`;
    }
    return 'Not specified';
  }

  const getImageDisplay = (crop: ICrop): React.ReactNode => {
    if (crop.image) {
      if (crop.image.startsWith('http')) {
        return (
          <img 
            src={crop.image} 
            alt={crop.name}
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      } else {
        return <span className="text-3xl">{crop.image}</span>;
      }
    }
    return <span className="text-3xl">🌱</span>;
  }

  // Update the results title function
  const getResultsTitle = () => {
    if (isSearching) {
      return `Search Results for "${searchQuery}"`
    }
    if (searchPerformed) {
      return 'Recommended Crops'
    }
    return 'Available Crops'
  }

  // Add these functions after your existing helper functions
  const getFertilizerDisplay = (fertilizerSchedule: any): React.ReactNode => {
    if (!fertilizerSchedule || typeof fertilizerSchedule !== 'object') {
      return <span className="text-muted-foreground">No fertilizer schedule available</span>;
    }

    // Check if it has regional variations (like upcountry)
    const hasRegionalVariations = Object.keys(fertilizerSchedule).some(key => 
      typeof fertilizerSchedule[key] === 'object' && 
      fertilizerSchedule[key].basal !== undefined
    );

    if (hasRegionalVariations) {
      // Handle structure with regional variations (upcountry, lowcountry, etc.)
      return (
        <div className="space-y-4">
          {Object.entries(fertilizerSchedule).map(([region, schedule]: [string, any]) => (
            <div key={region} className="border rounded-lg p-3">
              <h5 className="font-medium text-sm mb-3 capitalize text-primary">
                {region.replace(/([A-Z])/g, ' $1').trim()} Region
              </h5>
              {renderFertilizerTimeline(schedule)}
            </div>
          ))}
        </div>
      );
    } else {
      // Handle simple structure without regional variations
      return renderFertilizerTimeline(fertilizerSchedule);
    }
  };

  const renderFertilizerTimeline = (schedule: any): React.ReactNode => {
    if (!schedule || typeof schedule !== 'object') {
      return <span className="text-muted-foreground">No schedule data</span>;
    }

    const timelineStages = Object.entries(schedule).map(([stage, fertilizers]: [string, any]) => {
      if (typeof fertilizers !== 'object') return null;

      return (
        <div key={stage} className="mb-3">
          <div className="font-medium text-xs text-muted-foreground mb-2 capitalize">
            {stage.replace(/([A-Z])/g, ' $1').replace(/(\d+)/g, ' $1').trim()}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(fertilizers).map(([fertilizer, amount]: [string, any]) => (
              <div key={fertilizer} className="flex justify-between items-center bg-muted/50 px-2 py-1 rounded text-xs">
                <span className="font-medium uppercase">{fertilizer}:</span>
                <span>{String(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }).filter(Boolean);

    return (
      <div className="space-y-2">
        {timelineStages.length > 0 ? timelineStages : (
          <span className="text-muted-foreground text-xs">No fertilizer data available</span>
        )}
      </div>
    );
  };

  // Compact version for card display
  const getFertilizerSummary = (fertilizerSchedule: any): string => {
    if (!fertilizerSchedule || typeof fertilizerSchedule !== 'object') {
      return 'No fertilizer info';
    }

    // Check if it has regional variations
    const hasRegionalVariations = Object.keys(fertilizerSchedule).some(key => 
      typeof fertilizerSchedule[key] === 'object' && 
      fertilizerSchedule[key].basal !== undefined
    );

    if (hasRegionalVariations) {
      const regions = Object.keys(fertilizerSchedule);
      return `${regions.length} region(s) with schedule`;
    } else {
      const stages = Object.keys(fertilizerSchedule);
      return `${stages.length} application stages`;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crop Planning Assistant</h1>
          <p className="text-muted-foreground mt-1">Get personalized crop recommendations based on your local weather conditions</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Leaf className="w-4 h-4 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Weather Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Enter Your Location for Recommendations
          </CardTitle>
          <CardDescription>
            Enter your city name to get AI-powered crop recommendations based on local conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 flex gap-15">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Enter city name (e.g., Balangoda, Colombo)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Temperature (°C)</label>
              <Input
                type="number"
                placeholder="e.g., 25"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weather Condition</label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherConditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      <div className="flex items-center gap-2">
                        <condition.icon className="h-4 w-4" />
                        {condition.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="flex items-end">
              <Button 
                className="w-full" 
                onClick={getCropRecommendations}
                disabled={isRecommendationLoading || !location.trim()}
              >
                {isRecommendationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Recommendations...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Section - Add this after the weather input card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Crops by Name
          </CardTitle>
          <CardDescription>
            Search for specific crops by name, scientific name, or description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops (e.g., Tomato, Rice, Winged Bean)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={showAllCrops}
              className="whitespace-nowrap"
            >
              Show All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {getResultsTitle()}
          
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading crops...</span>
        </div>
      )}

      {/* Add results summary */}
      {(isSearching || searchPerformed) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSearching && (
            <Badge variant="secondary" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              Search: {searchQuery}
            </Badge>
          )}
          {searchPerformed && (
            <Badge variant="default" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Recommendations: {location}
            </Badge>
          )}
          {filter !== "all" && (
            <Badge variant="outline" className="text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Filter: {filterOptions.find(f => f.value === filter)?.label}
            </Badge>
          )}
        </div>
      )}

      {/* Crops Grid - Updated with Planting and Harvest Time */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.length > 0 ? (
            filteredCrops.map((crop) => (
              <Card 
                key={crop._id || crop.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCropSelect(crop)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {getImageDisplay(crop)}
                    <CardTitle className="text-lg">{crop.name}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Reduced Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {crop.description}
                  </p>
                  
                  {/* Planting and Harvest Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground text-sm">Planting:</span>
                      <span className="font-medium text-sm">{crop.plantingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-muted-foreground text-sm">Harvest:</span>
                      <span className="font-medium text-sm">{getHarvestTimeDisplay(crop.harvestTime)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {searchPerformed ? 'No Recommendations Found' : 'No Crops Available'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchPerformed 
                      ? 'We couldn\'t find specific crop recommendations for this location. Please try a different city.'
                      : 'Unable to load crop data. Please try again.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Detailed Crop Information Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] p-4 sm:max-w-[520px] rounded-l-sm">
          {selectedCrop && (
            <>
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  {getImageDisplay(selectedCrop)}
                  <div>
                    <SheetTitle className="text-2xl">{selectedCrop.name}</SheetTitle>
                    <Badge variant={getSuitabilityBadge(selectedCrop.suitability)} className="mt-1">
                      {selectedCrop.suitability}% Suitable for Your Conditions
                    </Badge>
                  </div>
                </div>
                <SheetDescription className="text-base">
                  {selectedCrop.description}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)]  p-10">
                <div className="space-y-6 ">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Scientific Name</div>
                        <div className="font-medium">{selectedCrop.scientificName}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="font-medium capitalize">{selectedCrop.type}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Temperature Range</div>
                        <div className="font-medium">{getTemperatureDisplay(selectedCrop)}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Water Requirement</div>
                        <div className="font-medium">{selectedCrop.waterRequirement}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Detailed Instructions */}
                  {selectedCrop.detailedInstructions && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Growing Instructions</h3>
                      
                      {selectedCrop.detailedInstructions.soilPreparation && (
                        <div>
                          <h4 className="font-medium text-primary mb-2 text-sm flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              🌱
                              <span>Soil Preparation</span>
                            </div>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCrop.detailedInstructions.soilPreparation}
                          </p>
                        </div>
                      )}

                      {selectedCrop.detailedInstructions.planting && (
                        <div>
                          <h4 className="font-medium text-primary mb-2 text-sm flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              🌿
                              <span>Planting</span>
                            </div>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCrop.detailedInstructions.planting}
                          </p>
                        </div>
                      )}

                      {selectedCrop.detailedInstructions.care && (
                        <div>
                          <h4 className="font-medium text-primary mb-2 text-sm flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              🚿
                              <span>Care & Maintenance</span>
                            </div>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCrop.detailedInstructions.care}
                          </p>
                        </div>
                      )}

                      {selectedCrop.detailedInstructions.pests && (
                        <div>
                          <h4 className="font-medium text-primary mb-2 text-sm flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              🛡️
                              <span>Pest Management</span>
                            </div>
                          </h4>
                          {Array.isArray(selectedCrop.detailedInstructions.pests) ? (
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {selectedCrop.detailedInstructions.pests.map((pest: string, index: number) => (
                                <li key={index} className="leading-relaxed">{pest}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedCrop.detailedInstructions.pests}
                            </p>
                          )}
                        </div>
                      )}

                      {selectedCrop.detailedInstructions.fertilizerSchedule && (
                         <>
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-green-600" />
                          Fertilizer Schedule
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          {getFertilizerDisplay(selectedCrop.detailedInstructions.fertilizerSchedule)}
                        </div>
                      </div>
                      <Separator />
                    </>)}

                      {selectedCrop.detailedInstructions.harvest && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              🌾
                              <span>Harvesting</span>
                            </div>
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCrop.detailedInstructions.harvest}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Growing Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Calendar className="h-4 w-4 text-chart-3" />
                        <div>
                          <div className="font-medium">Planting Time</div>
                          <div className="text-sm text-muted-foreground">{selectedCrop.plantingTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-chart-4" />
                        <div>
                          <div className="font-medium">Time to Harvest</div>
                          <div className="text-sm text-muted-foreground">{getHarvestTimeDisplay(selectedCrop.harvestTime)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2"></div>
              <span className="text-sm">Start with high-suitability crops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3"></div>
              <span className="text-sm">Consider succession planting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-4"></div>
              <span className="text-sm">Monitor weather patterns</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Season Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Based on current conditions, focus on cool-season crops like lettuce and spinach. 
              Plan warm-season crops for next month.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Weather Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current weather conditions favor leafy greens and root vegetables. 
              Consider protection for heat-sensitive crops.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
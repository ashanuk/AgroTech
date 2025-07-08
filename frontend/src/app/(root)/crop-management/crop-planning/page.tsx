"use client"

import { useState } from 'react'
import { Search, Cloud, Sun, CloudRain, Filter, Leaf, Wheat, TreePine, ChevronRight, Calendar, Droplets, Thermometer, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Dummy data for crop recommendations
const dummyCrops = [
  {
    id: 1,
    name: "Tomatoes",
    type: "vegetable",
    suitability: 95,
    plantingTime: "March - May",
    harvestTime: "75-85 days",
    waterRequirement: "Medium",
    temperatureRange: "20-25°C",
    image: "🍅",
    description: "Tomatoes are versatile vegetables that thrive in warm weather with consistent watering.",
    detailedInstructions: {
      soilPreparation: "Use well-draining, fertile soil with pH 6.0-6.8. Add compost or aged manure.",
      planting: "Start seeds indoors 6-8 weeks before last frost. Transplant after soil warms to 16°C.",
      care: "Water regularly, provide support stakes, prune suckers, and mulch around plants.",
      pests: "Watch for hornworms, aphids, and blight. Use companion planting with basil.",
      harvest: "Pick when fruits are fully colored but still firm. Store at room temperature."
    },
    requirements: {
      sunlight: "6-8 hours daily",
      spacing: "60-90cm apart",
      soilDepth: "30-45cm",
      watering: "1-2 inches per week"
    }
  },
  {
    id: 2,
    name: "Carrots",
    type: "vegetable",
    suitability: 88,
    plantingTime: "April - June",
    harvestTime: "70-80 days",
    waterRequirement: "Low-Medium",
    temperatureRange: "15-20°C",
    image: "🥕",
    description: "Root vegetables that prefer cooler weather and loose, sandy soil.",
    detailedInstructions: {
      soilPreparation: "Deep, loose, sandy soil free of rocks. pH 6.0-6.8.",
      planting: "Direct seed 1cm deep, thin to 5cm apart when seedlings emerge.",
      care: "Keep soil moist, weed regularly, avoid over-fertilizing with nitrogen.",
      pests: "Carrot fly, aphids. Use row covers for protection.",
      harvest: "Pull when shoulders are 2-3cm diameter. Can withstand light frost."
    },
    requirements: {
      sunlight: "6+ hours daily",
      spacing: "5cm apart",
      soilDepth: "20-30cm",
      watering: "1 inch per week"
    }
  },
  {
    id: 3,
    name: "Wheat",
    type: "grain",
    suitability: 82,
    plantingTime: "September - November",
    harvestTime: "150-200 days",
    waterRequirement: "Medium",
    temperatureRange: "10-24°C",
    image: "🌾",
    description: "Staple grain crop that requires cool weather for establishment and warm weather for maturation.",
    detailedInstructions: {
      soilPreparation: "Well-drained, fertile soil with pH 6.0-7.0. Deep tillage recommended.",
      planting: "Broadcast or drill seed at 40-60kg per hectare, 2-3cm deep.",
      care: "Monitor for diseases, apply nitrogen fertilizer in spring, control weeds.",
      pests: "Aphids, rust, powdery mildew. Use resistant varieties when possible.",
      harvest: "Cut when grain moisture is 12-14%. Dry and store properly."
    },
    requirements: {
      sunlight: "6+ hours daily",
      spacing: "Broadcast seeding",
      soilDepth: "Deep soil preferred",
      watering: "400-500mm annual"
    }
  },
  {
    id: 4,
    name: "Lettuce",
    type: "vegetable",
    suitability: 91,
    plantingTime: "March - September",
    harvestTime: "45-65 days",
    waterRequirement: "Medium",
    temperatureRange: "15-20°C",
    image: "🥬",
    description: "Cool-season leafy green that grows quickly in moderate temperatures.",
    detailedInstructions: {
      soilPreparation: "Rich, loose soil with good drainage. pH 6.0-7.0.",
      planting: "Start seeds indoors or direct seed. Plant 1cm deep.",
      care: "Keep soil consistently moist, provide afternoon shade in hot weather.",
      pests: "Aphids, slugs, cutworms. Use companion planting with chives.",
      harvest: "Cut leaves when young and tender, or harvest whole head."
    },
    requirements: {
      sunlight: "4-6 hours daily",
      spacing: "15-30cm apart",
      soilDepth: "15-20cm",
      watering: "1 inch per week"
    }
  },
  {
    id: 5,
    name: "Rice",
    type: "grain",
    suitability: 78,
    plantingTime: "May - July",
    harvestTime: "120-150 days",
    waterRequirement: "High",
    temperatureRange: "20-35°C",
    image: "🌾",
    description: "Water-intensive grain crop requiring warm temperatures and flooded fields.",
    detailedInstructions: {
      soilPreparation: "Clay or loam soil that can hold water. Level fields for flooding.",
      planting: "Transplant seedlings or direct seed in flooded fields.",
      care: "Maintain water levels, fertilize regularly, control weeds.",
      pests: "Rice blast, brown planthopper. Use integrated pest management.",
      harvest: "Cut when grains are golden yellow. Dry before storage."
    },
    requirements: {
      sunlight: "6+ hours daily",
      spacing: "20x20cm grid",
      soilDepth: "20-30cm",
      watering: "Flooded conditions"
    }
  },
  {
    id: 6,
    name: "Spinach",
    type: "vegetable",
    suitability: 89,
    plantingTime: "March - May, August - October",
    harvestTime: "40-50 days",
    waterRequirement: "Medium",
    temperatureRange: "10-18°C",
    image: "🥬",
    description: "Fast-growing leafy green that prefers cool weather and can tolerate light frost.",
    detailedInstructions: {
      soilPreparation: "Rich, well-draining soil with pH 6.0-7.0. Add compost.",
      planting: "Direct seed 1cm deep, thin to 10cm apart.",
      care: "Keep soil moist, provide shade in hot weather, succession plant.",
      pests: "Leaf miners, aphids. Use row covers for protection.",
      harvest: "Cut outer leaves when 5-7cm long, or harvest whole plant."
    },
    requirements: {
      sunlight: "4-6 hours daily",
      spacing: "10cm apart",
      soilDepth: "15-20cm",
      watering: "1 inch per week"
    }
  }
]

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
  const [selectedCrop, setSelectedCrop] = useState<typeof dummyCrops[0] | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredCrops = dummyCrops.filter(crop => 
    filter === "all" || crop.type === filter
  ).sort((a, b) => b.suitability - a.suitability)

  const handleCropSelect = (crop: typeof dummyCrops[0]) => {
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
            Enter Your Weather Conditions
          </CardTitle>
          <CardDescription>
            Provide your current location and weather to get the best crop recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Enter your city or region"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
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
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recommended Crops</h2>
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

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <Card 
            key={crop.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCropSelect(crop)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{crop.image}</span>
                  <div>
                    <CardTitle className="text-lg">{crop.name}</CardTitle>
                    <Badge variant={getSuitabilityBadge(crop.suitability)} className="text-xs mt-1">
                      {crop.suitability}% Suitable
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{crop.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-chart-3" />
                  <span className="text-muted-foreground">Plant:</span>
                  <span className="font-medium">{crop.plantingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-chart-4" />
                  <span className="text-muted-foreground">Harvest:</span>
                  <span className="font-medium">{crop.harvestTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-chart-2" />
                  <span className="text-muted-foreground">Water:</span>
                  <span className="font-medium">{crop.waterRequirement}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-chart-1" />
                  <span className="text-muted-foreground">Temp:</span>
                  <span className="font-medium">{crop.temperatureRange}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Crop Information Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] p-4">
          {selectedCrop && (
            <>
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCrop.image}</span>
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

              <ScrollArea className="h-[calc(100vh-200px)] mt-6 p-4">
                <div className="space-y-6">
                  {/* Basic Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Growing Requirements</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Sunlight</div>
                        <div className="font-medium">{selectedCrop.requirements.sunlight}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Spacing</div>
                        <div className="font-medium">{selectedCrop.requirements.spacing}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Soil Depth</div>
                        <div className="font-medium">{selectedCrop.requirements.soilDepth}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Watering</div>
                        <div className="font-medium">{selectedCrop.requirements.watering}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Detailed Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Growing Instructions</h3>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">Soil Preparation</h4>
                      <p className="text-sm text-muted-foreground">{selectedCrop.detailedInstructions.soilPreparation}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Planting</h4>
                      <p className="text-sm text-muted-foreground">{selectedCrop.detailedInstructions.planting}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Care & Maintenance</h4>
                      <p className="text-sm text-muted-foreground">{selectedCrop.detailedInstructions.care}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Pest Management</h4>
                      <p className="text-sm text-muted-foreground">{selectedCrop.detailedInstructions.pests}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Harvesting</h4>
                      <p className="text-sm text-muted-foreground">{selectedCrop.detailedInstructions.harvest}</p>
                    </div>
                  </div>

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
                          <div className="text-sm text-muted-foreground">{selectedCrop.harvestTime}</div>
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
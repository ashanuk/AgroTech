"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'

// Types for API response
interface ForecastItem {
  Date: string;
  Predicted_Price: number;
}

interface HistoryItem {
  Date: string;
  Price: number;
}

interface ApiResponse {
  forecast: ForecastItem[];
  history: HistoryItem[];
}

// Types for chart data
interface ChartDataItem {
  date: string;
  historical: number | null;
  future: number | null;
  type: 'historical' | 'future';
}

// Combine and format data for the chart
const formatChartData = (historyData: HistoryItem[], forecastData: ForecastItem[]): ChartDataItem[] => {
  // Set reference date to January 1, 2025
  const referenceDate = new Date('2025-01-01')
  referenceDate.setHours(0, 0, 0, 0)
  
  // Calculate 6 months before January 1, 2025
  const sixMonthsBefore = new Date('2025-01-01')
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6)
  sixMonthsBefore.setHours(0, 0, 0, 0)
  
  // Filter historical data to only include 6 months before 2025-01-01
  const filteredHistoryData = historyData.filter(item => {
    const itemDate = new Date(item.Date)
    return itemDate >= sixMonthsBefore && itemDate < referenceDate
  })
  
  // Process historical data (past 6 months from 2025-01-01)
  const historicalChartData = filteredHistoryData.map(item => ({
    date: new Date(item.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    historical: item.Price,
    future: null,
    type: 'historical' as const
  }))

  // Process forecast data (predicted data)
  const forecastChartData = forecastData.map(item => ({
    date: new Date(item.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    historical: null,
    future: item.Predicted_Price,
    type: 'future' as const
  }))

  // Combine and sort by date
  const combinedData = [...historicalChartData, ...forecastChartData]
  combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return combinedData
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
        <p className="font-medium text-popover-foreground">{label}</p>
        <p className="text-sm">
          <span className={`font-medium ${data.dataKey === 'historical' ? 'text-blue-600' : 'text-green-600'}`}>
            {data.dataKey === 'historical' ? 'Historical' : 'Predicted'}: Rs{data.value?.toFixed(2)}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export default function PricePredictionPage() {
  const [data, setData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highestPrice, setHighestPrice] = useState(0)
  const [lowestPrice, setLowestPrice] = useState(0)
  const [averagePrice, setAveragePrice] = useState(0)

  // Fetch data from backend
  useEffect(() => {
    const fetchPredictionData = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://agrotech-idut.onrender.com/predict')
        // const response = await fetch('http://localhost:8000/predict')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const responseData: ApiResponse = await response.json()
        
        if (responseData && responseData.history && responseData.forecast) {
          setData(formatChartData(responseData.history, responseData.forecast))
          
          // Calculate statistics from forecast data
          if (responseData.forecast.length > 0) {
            const prices = responseData.forecast.map(item => item.Predicted_Price)
            setHighestPrice(Math.max(...prices))
            setLowestPrice(Math.min(...prices))
            setAveragePrice(prices.reduce((sum, price) => sum + price, 0) / prices.length)
          }
        } else {
          console.error('Invalid data structure:', responseData)
          setError('Received invalid data format from API')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prediction data')
        console.error('Error fetching prediction data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictionData()
  }, [])

  // Calculate stats from the data
  const getDisplayStats = () => {
    if (data.length === 0) return { 
      currentPrice: 0, 
      predictedPrice: 0, 
      avgHistorical: 0,
      avgFuture: 0,
      trend: 'up' as const, 
      changePercent: '0.0' 
    }
    
    const historicalData = data.filter(item => item.type === 'historical' && item.historical !== null)
    const futureData = data.filter(item => item.type === 'future' && item.future !== null)
    
    const currentPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].historical! : 0
    const predictedPrice = futureData.length > 0 ? futureData[futureData.length - 1].future! : 0
    
    const avgHistorical = historicalData.length > 0 
      ? historicalData.reduce((sum, item) => sum + item.historical!, 0) / historicalData.length
      : 0
    
    const avgFuture = futureData.length > 0
      ? futureData.reduce((sum, item) => sum + item.future!, 0) / futureData.length
      : 0
    
    const trend = predictedPrice > currentPrice ? 'up' : 'down'
    const changePercent = currentPrice > 0 
      ? ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(1) 
      : '0.0'
    
    return { currentPrice, predictedPrice, avgHistorical, avgFuture, trend, changePercent }
  }

  const stats = getDisplayStats()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading prediction data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error: {error}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rice Price Prediction</h1>
          <p className="text-muted-foreground mt-1">Historical trends and AI-powered future price predictions</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.currentPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.predictedPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">final prediction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Historical Avg</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.avgHistorical.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">past prices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Change</CardTitle>
            {stats.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-chart-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.trend === 'up' ? 'text-chart-2' : 'text-destructive'}`}>
              {stats.trend === 'up' ? '+' : ''}{stats.changePercent}%
            </div>
            <p className="text-xs text-muted-foreground">vs historical avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rice Price Trends & Predictions</CardTitle>
          <CardDescription>
            Historical prices (blue) and AI-predicted future prices (green) per kg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  label={{ value: 'Price (Rs)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="historical" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                  connectNulls={false}
                  name="Historical Prices"
                />
                <Line 
                  type="monotone" 
                  dataKey="future" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 2 }}
                  connectNulls={false}
                  name="Predicted Prices"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-sm text-card-foreground">Historical data shows past trends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm text-card-foreground">AI predicts future market trends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-sm text-card-foreground">Seasonal variations expected</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Prediction data: Live AI model</p>
            <p className="text-sm text-muted-foreground">Model: Based on weather, demand, and supply factors</p>
            <p className="text-sm text-muted-foreground">Update frequency: Real-time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
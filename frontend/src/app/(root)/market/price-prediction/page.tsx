"use client"

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'

// Dummy chart data
const dummyData = {
  historical: [
    { date: '2024-01-01', price: 45.50 },
    { date: '2024-01-15', price: 47.20 },
    { date: '2024-02-01', price: 46.80 },
    { date: '2024-02-15', price: 48.90 },
    { date: '2024-03-01', price: 49.30 },
    { date: '2024-03-15', price: 51.20 },
    { date: '2024-04-01', price: 50.80 },
    { date: '2024-04-15', price: 52.40 },
    { date: '2024-05-01', price: 53.60 },
    { date: '2024-05-15', price: 55.20 },
    { date: '2024-06-01', price: 54.80 },
    { date: '2024-06-15', price: 56.90 },
    { date: '2024-07-01', price: 58.20 },
  ],
  future: [
    { date: '2024-07-15', price: 59.50 },
    { date: '2024-08-01', price: 61.20 },
    { date: '2024-08-15', price: 62.80 },
    { date: '2024-09-01', price: 64.10 },
    { date: '2024-09-15', price: 63.40 },
    { date: '2024-10-01', price: 65.70 },
    { date: '2024-10-15', price: 67.20 },
    { date: '2024-11-01', price: 68.90 },
    { date: '2024-11-15', price: 70.50 },
    { date: '2024-12-01', price: 72.10 },
  ]
}



export default function PricePredictionPage() {

  // Combine and format data for the chart
  const formatChartData = (historical: any[], future: any[]) => {
    const historicalData = historical.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      historical: item.price,
      future: null,
      type: 'historical'
    }))

    const futureData = future.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      historical: null,
      future: item.price,
      type: 'future'
    }))

    return [...historicalData, ...futureData]
  }

  const chartData = formatChartData(dummyData.historical, dummyData.future)

  // Calculate statistics
  const getStats = () => {
    const lastHistorical = dummyData.historical[dummyData.historical.length - 1]
    const lastFuture = dummyData.future[dummyData.future.length - 1]
    const avgHistorical = dummyData.historical.reduce((sum, item) => sum + item.price, 0) / dummyData.historical.length
    const avgFuture = dummyData.future.reduce((sum, item) => sum + item.price, 0) / dummyData.future.length

    return {
      currentPrice: lastHistorical.price,
      predictedPrice: lastFuture.price,
      avgHistorical: avgHistorical,
      avgFuture: avgFuture,
      trend: avgFuture > avgHistorical ? 'up' : 'down',
      changePercent: ((avgFuture - avgHistorical) / avgHistorical * 100).toFixed(1)
    }
  }

  const stats = getStats()

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium text-popover-foreground">{label}</p>
          <p className="text-sm">
            <span className={`font-medium ${data.dataKey === 'historical' ? 'text-blue-600' : 'text-green-600'}`}>
              {data.dataKey === 'historical' ? 'Historical' : 'Predicted'}: ${data.value?.toFixed(2)}
            </span>
          </p>
        </div>
      )
    }
    return null
  }



  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rice Price Prediction</h1>
          <p className="text-muted-foreground mt-1">Historical data and future price predictions</p>
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
            <div className="text-2xl font-bold">${stats.currentPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.predictedPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">by Dec 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Historical</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgHistorical.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Jan-Jul 2024</p>
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
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                  name="Historical Prices"
                />
                <Line
                  type="monotone"
                  dataKey="future"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
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
              <span className="text-sm text-card-foreground">Historical data shows steady growth pattern</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm text-card-foreground">AI predicts continued upward trend</span>
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
            <p className="text-sm text-muted-foreground">Historical data: Market trading records</p>
            <p className="text-sm text-muted-foreground">Predictions: AI model based on weather, demand, and supply factors</p>
            <p className="text-sm text-muted-foreground">Update frequency: Daily</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
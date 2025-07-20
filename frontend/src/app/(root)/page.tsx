"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { 
  Sprout, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Leaf,
  Sun,
  ArrowRight,
  Star,
  BarChart3,
  Package,
  Globe,
  Zap,
  ChevronRight,
  Clock,
  Heart,
  Award,
  Bell,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  User,
  BarChart,
  Info,
  Settings,
  X
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { GET_THREADS } from "@/lib/graphql/queries";
import { Thread } from "@/lib/graphql/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the structure for a thread from GraphQL
interface CommunityThread {
  id: string;
  title: string;
  user: {
    username: string;
    avatar_url?: string;
  };
  post_count: number;
  category: {
    name: string;
  };
  created_at: string;
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState(new Date());
  const [showProfileBanner, setShowProfileBanner] = useState(false);

    // Check if user's profile is incomplete
  const isProfileIncomplete = !session?.user?.name || session.user.name.trim() === "";

  // Fetch latest 3 threads using GraphQL
  const { data: threadsData, loading: threadsLoading } = useQuery(GET_THREADS, {
    variables: {
      limit: 3,
      offset: 0
    },
    errorPolicy: "ignore" // Don't crash the dashboard if forum API is down
  });

  const threads: CommunityThread[] = threadsData?.threads || [];

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000); // Update every minute
    
    // Show banner if profile is incomplete and user hasn't dismissed it in this session
    if (isProfileIncomplete && !sessionStorage.getItem('profileBannerDismissed')) {
      setShowProfileBanner(true);
    }
    
    return () => clearInterval(timer);
  }, [isProfileIncomplete]);

  const getGreeting = () => {
    const hour = date.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

    const handleDismissBanner = () => {
    setShowProfileBanner(false);
    sessionStorage.setItem('profileBannerDismissed', 'true');
  };

  const chartData = [
    { month: "January", yield: 186 },
    { month: "February", yield: 305 },
    { month: "March", yield: 237 },
    { month: "April", yield: 273 },
    { month: "May", yield: 209 },
    { month: "June", yield: 214 },
  ];

  const chartConfig = {
    yield: {
      label: "Yield (kg)",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const notifications = [
    {
      type: "alert",
      icon: AlertTriangle,
      title: "Pest Alert: Aphids detected in your region.",
      time: "15m ago",
      color: "text-destructive"
    },
    {
      type: "info",
      icon: MessageSquare,
      title: "New message from 'FarmFresh Buyers'",
      time: "1h ago",
      color: "text-primary"
    },
    {
      type: "success",
      icon: CheckCircle,
      title: "Your 'Tomatoes' listing was approved.",
      time: "3h ago",
      color: "text-green-500"
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Profile Completion Banner */}
      {showProfileBanner && (
        <Alert className="border-l-4 border-l-primary bg-primary/5 rounded-l-none">
          <Info className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold">Complete Your Profile</AlertTitle>
              <AlertDescription className="text-sm">
                Welcome to AgroTech! Please complete your profile to get the most out of our platform and connect with the farming community.
              </AlertDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Link href="/user/profile">
                <Button size="sm" className="whitespace-nowrap cursor-pointer">
                  <Settings className="h-4 w-4 mr-1" />
                  Update Profile
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismissBanner}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Alert>
      )}

      
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || "Farmer"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on your farm today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Yield Overview Chart */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Yield Overview</CardTitle>
              <CardDescription>Your farm's yield over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area dataKey="yield" type="natural" fill="url(#fillYield)" stroke="var(--color-chart-1)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-2 bg-chart-1/20 rounded-lg w-fit">
                  <Sprout className="h-6 w-6 text-chart-1" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">Crop Planning</h3>
                <p className="text-sm text-muted-foreground mt-1">Get AI-powered crop recommendations.</p>
                <Link href="/crop-management/crop-planning">
                  <Button variant="link" className="p-0 mt-2 cursor-pointer">
                    Plan Crops <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-2 bg-chart-2/20 rounded-lg w-fit">
                  <ShoppingCart className="h-6 w-6 text-chart-2" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">Manage Products</h3>
                <p className="text-sm text-muted-foreground mt-1">List and manage your farm products.</p>
                <Link href="/user/sell-products">
                  <Button variant="link" className="p-0 mt-2 cursor-pointer">
                    View Marketplace <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-2 bg-chart-3/20 rounded-lg w-fit">
                  <BarChart className="h-6 w-6 text-chart-3" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">Price Predictions</h3>
                <p className="text-sm text-muted-foreground mt-1">View historical and predicted prices of crops.</p>
                <Link href="/market/price-prediction">
                  <Button variant="link" className="p-0 mt-2 cursor-pointer">
                    View Price Analytics <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-2 bg-chart-5/20 rounded-lg w-fit">
                  <User className="h-6 w-6 text-chart-5" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">Your Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">View and update your profile details.</p>
                <Link href="/user/profile">
                  <Button variant="link" className="p-0 mt-2 cursor-pointer">
                    View Profile <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>

          {/* Community Feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Community Feed</CardTitle>
                <CardDescription>Latest discussions from the forum.</CardDescription>
              </div>
              <Link href="/community/forum/create">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threadsLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : threads.length > 0 ? (
                  threads.map((thread) => (
                    <div key={thread.id} className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 hidden sm:flex">
                          <AvatarImage src={thread.user.avatar_url} />
                          <AvatarFallback>
                            {thread.user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/community/forum/thread/${thread.id}`}>
                            <p className="font-medium hover:underline line-clamp-2">
                              {thread.title}
                            </p>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            by {thread.user.username} • {thread.post_count || 0} replies • {formatDistanceToNow(new Date(thread.created_at))}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="hidden md:inline-flex text-xs">
                        {thread.category.name}
                      </Badge>
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent discussions</p>
                    <Link href="/community/forum">
                      <Button variant="link" size="sm" className="mt-1 cursor-pointer">
                        Visit Forum
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {threads.length > 0 && (
                <div className="pt-4 border-t">
                  <Link href="/community/forum">
                    <Button variant="outline" size="sm" className="w-full cursor-pointer">
                      View All Discussions
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <notification.icon className={`h-5 w-5 mt-1 flex-shrink-0 ${notification.color}`} />
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have a question? Get instant farming advice from our AI.
              </p>
              <Link href="/community/chat">
                <Button className="w-full cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
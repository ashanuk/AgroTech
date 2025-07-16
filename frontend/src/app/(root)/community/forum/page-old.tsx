"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
  Search,
  Plus,
  MessageCircle,
  Calendar,
  Eye,
  ThumbsUp,
  Pin,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { GET_CATEGORIES, GET_THREADS } from "@/lib/graphql/queries";
import { Category, Thread } from "@/lib/graphql/types";
import { formatDistanceToNow } from "date-fns";

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("latest");

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: threadsData, loading: threadsLoading, refetch: refetchThreads } = useQuery(GET_THREADS, {
    variables: {
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 20,
      offset: 0
    }
  });

  const categories: Category[] = categoriesData?.categories || [];
  const threads: Thread[] = threadsData?.threads || [];

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    refetchThreads({
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 20,
      offset: 0
    });
  }, [selectedCategory, refetchThreads]);
  color: string;
  threadCount: number;
}

const categories: ForumCategory[] = [
  {
    id: "general",
    name: "General Discussion",
    description: "General farming topics and discussions",
    color: "bg-blue-500",
    threadCount: 45,
  },
  {
    id: "crop-management",
    name: "Crop Management",
    description: "Planting, growing, and harvesting techniques",
    color: "bg-green-500",
    threadCount: 78,
  },
  {
    id: "pest-control",
    name: "Pest & Disease Control",
    description: "Dealing with pests and plant diseases",
    color: "bg-red-500",
    threadCount: 32,
  },
  {
    id: "irrigation",
    name: "Irrigation & Water Management",
    description: "Water usage, irrigation systems, and conservation",
    color: "bg-cyan-500",
    threadCount: 24,
  },
  {
    id: "equipment",
    name: "Equipment & Technology",
    description: "Farm equipment, tools, and agricultural technology",
    color: "bg-purple-500",
    threadCount: 19,
  },
  {
    id: "market",
    name: "Market & Prices",
    description: "Crop prices, market trends, and selling strategies",
    color: "bg-yellow-500",
    threadCount: 56,
  },
  {
    id: "organic",
    name: "Organic Farming",
    description: "Sustainable and organic farming practices",
    color: "bg-emerald-500",
    threadCount: 41,
  },
  {
    id: "livestock",
    name: "Livestock",
    description: "Animal husbandry and livestock management",
    color: "bg-orange-500",
    threadCount: 28,
  },
];

const dummyThreads: ForumThread[] = [
  {
    id: "1",
    title: "Best irrigation techniques for rice cultivation in monsoon season",
    description:
      "Looking for advice on managing water levels during heavy rainfall periods. My fields tend to get waterlogged...",
    author: { name: "Ramesh Kumar", id: "user1" },
    category: "irrigation",
    tags: ["rice", "monsoon", "water-management"],
    replies: 23,
    views: 156,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isSticky: true,
    isLocked: false,
    likes: 34,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Organic pesticide alternatives for tomato crops",
    description:
      "Has anyone tried neem oil or other organic solutions for controlling aphids and whiteflies on tomatoes?",
    author: { name: "Priya Sharma", id: "user2" },
    category: "pest-control",
    tags: ["tomato", "organic", "pesticide", "aphids"],
    replies: 18,
    views: 89,
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isSticky: false,
    isLocked: false,
    likes: 27,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Current wheat prices in Punjab market",
    description:
      "What are the current wheat prices in Punjab mandis? Should I sell now or wait for better rates?",
    author: { name: "Gurpreet Singh", id: "user3" },
    category: "market",
    tags: ["wheat", "prices", "punjab", "market"],
    replies: 12,
    views: 234,
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isSticky: false,
    isLocked: false,
    likes: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Soil testing results interpretation help needed",
    description:
      "I got my soil test results back but I'm not sure how to interpret the NPK levels and pH readings...",
    author: { name: "Anita Patel", id: "user4" },
    category: "crop-management",
    tags: ["soil-testing", "npk", "ph", "fertilizer"],
    replies: 31,
    views: 178,
    lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isSticky: false,
    isLocked: false,
    likes: 42,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    title: "Drip irrigation system installation guide",
    description:
      "Step-by-step guide for installing a drip irrigation system for a 2-acre vegetable farm...",
    author: { name: "Mohammed Ali", id: "user5" },
    category: "irrigation",
    tags: ["drip-irrigation", "vegetables", "installation", "guide"],
    replies: 45,
    views: 567,
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isSticky: false,
    isLocked: false,
    likes: 68,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export default function ForumPage() {
  const [threads] = useState<ForumThread[]>(dummyThreads);
  const [filteredThreads, setFilteredThreads] =
    useState<ForumThread[]>(dummyThreads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Filter and sort threads
  useEffect(() => {
    let filtered = threads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (thread) =>
          thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          thread.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          thread.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (thread) => thread.category === selectedCategory
      );
    }

    // Sort threads
    switch (sortBy) {
      case "latest":
        filtered.sort(
          (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "most-replies":
        filtered.sort((a, b) => b.replies - a.replies);
        break;
      case "most-views":
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredThreads(filtered);
  }, [threads, searchTerm, selectedCategory, sortBy]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Farmer Forum</h1>
              <p className="text-muted-foreground">
                Connect, share knowledge, and grow together
              </p>
            </div>
            <Link href="/community/forum/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="most-replies">Most Replies</SelectItem>
                <SelectItem value="most-views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Forum Categories Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <CardTitle className="text-sm font-medium">
                    {category.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {category.description}
                </p>
                <div className="flex justify-between text-xs">
                  <span>{category.threadCount} threads</span>
                  <span className="text-muted-foreground">View all</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forum Threads */}
        <div className="space-y-4">
          {filteredThreads.map((thread) => {
            const categoryInfo = getCategoryInfo(thread.category);
            return (
              <Card
                key={thread.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.isSticky && (
                          <Pin className="h-4 w-4 text-amber-500" />
                        )}
                        <Link href={`/community/forum/thread/${thread.id}`}>
                          <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                            {thread.title}
                          </h3>
                        </Link>
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {thread.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        {categoryInfo && (
                          <Badge variant="secondary" className="gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${categoryInfo.color}`}
                            />
                            {categoryInfo.name}
                          </Badge>
                        )}
                        {thread.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={thread.author.avatar} />
                              <AvatarFallback>
                                {thread.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{thread.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatTimeAgo(thread.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{thread.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{thread.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{thread.views}</span>
                          </div>
                          <div className="text-xs">
                            Last activity: {formatTimeAgo(thread.lastActivity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredThreads.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No threads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Be the first to start a discussion!"}
            </p>
            <Link href="/community/forum/create">
              <Button>Create New Thread</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

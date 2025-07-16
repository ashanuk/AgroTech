"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Share2,
  Flag,
  Calendar,
  Eye,
  MessageCircle,
  Pin,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface ThreadReply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    id: string;
    joinDate: Date;
    postCount: number;
  };
  createdAt: Date;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies?: ThreadReply[];
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    id: string;
    joinDate: Date;
    postCount: number;
  };
  category: string;
  tags: string[];
  replies: ThreadReply[];
  views: number;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isSticky: boolean;
  isLocked: boolean;
  createdAt: Date;
  lastActivity: Date;
}

const categories: Record<string, { name: string; color: string }> = {
  general: { name: "General Discussion", color: "bg-blue-500" },
  "crop-management": { name: "Crop Management", color: "bg-green-500" },
  "pest-control": { name: "Pest & Disease Control", color: "bg-red-500" },
  irrigation: { name: "Irrigation & Water Management", color: "bg-cyan-500" },
  equipment: { name: "Equipment & Technology", color: "bg-purple-500" },
  market: { name: "Market & Prices", color: "bg-yellow-500" },
  organic: { name: "Organic Farming", color: "bg-emerald-500" },
  livestock: { name: "Livestock", color: "bg-orange-500" },
};

// Dummy data for demonstration
const dummyThread: ForumThread = {
  id: "1",
  title: "Best irrigation techniques for rice cultivation in monsoon season",
  content: `Looking for advice on managing water levels during heavy rainfall periods. My fields tend to get waterlogged during the monsoon season, and I'm struggling to maintain proper irrigation for my rice crops.

I'm currently using flood irrigation, but I'm wondering if there are better alternatives that can help me:

1. Prevent waterlogging during heavy rains
2. Maintain consistent water levels
3. Reduce water wastage
4. Improve crop yield

My farm is located in Punjab, and I have about 10 acres of rice fields. The soil is clay-loam, and we typically get 600-800mm of rainfall during monsoon.

Has anyone faced similar challenges? What irrigation methods have worked best for you in similar conditions?

Any advice would be greatly appreciated!`,
  author: {
    name: "Ramesh Kumar",
    id: "user1",
    joinDate: new Date("2023-01-15"),
    postCount: 45,
  },
  category: "irrigation",
  tags: ["rice", "monsoon", "water-management", "punjab"],
  replies: [
    {
      id: "r1",
      content:
        "I've been using System of Rice Intensification (SRI) method for the past 3 years, and it's been a game-changer! Instead of continuous flooding, you maintain just 2-3 cm of water, which reduces waterlogging issues significantly.",
      author: {
        name: "Priya Sharma",
        id: "user2",
        joinDate: new Date("2022-08-20"),
        postCount: 78,
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 12,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    },
    {
      id: "r2",
      content:
        "Consider installing drainage systems around your fields. I had similar issues in my fields in Haryana. Installing proper drainage channels helped manage excess water during heavy rains while maintaining irrigation during dry spells.",
      author: {
        name: "Gurpreet Singh",
        id: "user3",
        joinDate: new Date("2023-03-10"),
        postCount: 23,
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 8,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    },
    {
      id: "r3",
      content:
        "Have you considered drip irrigation for rice? I know it sounds unusual, but there are some innovative techniques being developed. Also, check with your local agricultural extension office - they often have region-specific solutions.",
      author: {
        name: "Dr. Anita Patel",
        id: "user4",
        joinDate: new Date("2021-12-05"),
        postCount: 156,
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 15,
      dislikes: 1,
      isLiked: true,
      isDisliked: false,
    },
  ],
  views: 234,
  likes: 28,
  dislikes: 2,
  isLiked: false,
  isDisliked: false,
  isSticky: true,
  isLocked: false,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

export default function ThreadPage() {
  const [thread, setThread] = useState<ForumThread>(dummyThread);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLike = (type: "thread" | "reply", id?: string) => {
    if (type === "thread") {
      setThread((prev) => ({
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
        isLiked: !prev.isLiked,
        isDisliked: false,
      }));
    } else if (id) {
      setThread((prev) => ({
        ...prev,
        replies: prev.replies.map((reply) =>
          reply.id === id
            ? {
                ...reply,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                dislikes: reply.isDisliked
                  ? reply.dislikes - 1
                  : reply.dislikes,
                isLiked: !reply.isLiked,
                isDisliked: false,
              }
            : reply
        ),
      }));
    }
  };

  const handleDislike = (type: "thread" | "reply", id?: string) => {
    if (type === "thread") {
      setThread((prev) => ({
        ...prev,
        dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes,
        isDisliked: !prev.isDisliked,
        isLiked: false,
      }));
    } else if (id) {
      setThread((prev) => ({
        ...prev,
        replies: prev.replies.map((reply) =>
          reply.id === id
            ? {
                ...reply,
                dislikes: reply.isDisliked
                  ? reply.dislikes - 1
                  : reply.dislikes + 1,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes,
                isDisliked: !reply.isDisliked,
                isLiked: false,
              }
            : reply
        ),
      }));
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newReply: ThreadReply = {
      id: `r${Date.now()}`,
      content: replyContent,
      author: {
        name: "Current User",
        id: "current-user",
        joinDate: new Date("2023-06-01"),
        postCount: 12,
      },
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    };

    setThread((prev) => ({
      ...prev,
      replies: [...prev.replies, newReply],
    }));

    setReplyContent("");
    setIsSubmitting(false);
  };

  const categoryInfo = categories[thread.category];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/community/forum">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{thread.views} views</span>
          </div>
        </div>
      </div>

      {/* Thread */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.isSticky && <Pin className="h-4 w-4 text-amber-500" />}
                {thread.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                <h1 className="text-2xl font-bold">{thread.title}</h1>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {categoryInfo && (
                  <Badge variant="secondary" className="gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${categoryInfo.color}`}
                    />
                    {categoryInfo.name}
                  </Badge>
                )}
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
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
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none mb-6">
            {thread.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={thread.isLiked ? "default" : "ghost"}
                size="sm"
                onClick={() => handleLike("thread")}
                className="gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {thread.likes}
              </Button>
              <Button
                variant={thread.isDisliked ? "destructive" : "ghost"}
                size="sm"
                onClick={() => handleDislike("thread")}
                className="gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                {thread.dislikes}
              </Button>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{thread.replies.length} replies</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">
          Replies ({thread.replies.length})
        </h2>

        {thread.replies.map((reply, index) => (
          <Card key={reply.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reply.author.avatar} />
                    <AvatarFallback>
                      {reply.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{reply.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="prose max-w-none mb-4">
                    <p>{reply.content}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={reply.isLiked ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleLike("reply", reply.id)}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {reply.likes}
                      </Button>
                      <Button
                        variant={reply.isDisliked ? "destructive" : "ghost"}
                        size="sm"
                        onClick={() => handleDislike("reply", reply.id)}
                        className="gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {reply.dislikes}
                      </Button>
                    </div>

                    <Button variant="ghost" size="sm" className="gap-1">
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-1">
                      <Flag className="h-4 w-4" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Post a Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply}>
              <Textarea
                placeholder="Write your reply here..."
                value={replyContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setReplyContent(e.target.value)
                }
                rows={6}
                className="mb-4"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Reply className="h-4 w-4" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {thread.isLocked && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>This thread is locked. No new replies can be posted.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

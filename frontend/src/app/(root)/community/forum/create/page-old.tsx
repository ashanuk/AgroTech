"use client";

import { useState } from "react";
import { ArrowLeft, Send, Tag, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

const categories: ForumCategory[] = [
  {
    id: "general",
    name: "General Discussion",
    description: "General farming topics and discussions",
    color: "bg-blue-500",
  },
  {
    id: "crop-management",
    name: "Crop Management",
    description: "Planting, growing, and harvesting techniques",
    color: "bg-green-500",
  },
  {
    id: "pest-control",
    name: "Pest & Disease Control",
    description: "Dealing with pests and plant diseases",
    color: "bg-red-500",
  },
  {
    id: "irrigation",
    name: "Irrigation & Water Management",
    description: "Water usage, irrigation systems, and conservation",
    color: "bg-cyan-500",
  },
  {
    id: "equipment",
    name: "Equipment & Technology",
    description: "Farm equipment, tools, and agricultural technology",
    color: "bg-purple-500",
  },
  {
    id: "market",
    name: "Market & Prices",
    description: "Crop prices, market trends, and selling strategies",
    color: "bg-yellow-500",
  },
  {
    id: "organic",
    name: "Organic Farming",
    description: "Sustainable and organic farming practices",
    color: "bg-emerald-500",
  },
  {
    id: "livestock",
    name: "Livestock",
    description: "Animal husbandry and livestock management",
    color: "bg-orange-500",
  },
];

const suggestedTags = [
  "irrigation",
  "organic",
  "pest-control",
  "fertilizer",
  "seeds",
  "harvest",
  "monsoon",
  "drought",
  "rice",
  "wheat",
  "corn",
  "tomato",
  "vegetables",
  "fruits",
  "cattle",
  "poultry",
  "soil-testing",
  "market-prices",
  "equipment",
  "technology",
  "sustainable",
  "climate-change",
  "water-conservation",
];

export default function CreateThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    setIsSubmitting(true);

    // Here you would typically send the data to your API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After successful creation, redirect to the forum page
      router.push("/community/forum");
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryInfo = categories.find((cat) => cat.id === category);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/community/forum">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Create New Thread</h1>
        <p className="text-muted-foreground">
          Start a new discussion with the farming community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thread Details</CardTitle>
              <CardDescription>
                Provide clear and descriptive information about your topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear and descriptive title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${cat.color}`}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategoryInfo && (
                    <p className="text-sm text-muted-foreground">
                      {selectedCategoryInfo.description}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your topic. Include context, specific questions, and any relevant details..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDescription(e.target.value)
                    }
                    rows={8}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {description.length}/1000 characters
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    placeholder="Add tags to help others find your thread..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={tags.length >= 5}
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to add tags. Max 5 tags allowed.
                  </p>
                </div>

                {/* Suggested Tags */}
                <div className="space-y-2">
                  <Label>Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.slice(0, 12).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => handleAddTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      !title || !description || !category || isSubmitting
                    }
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Create Thread
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• Be respectful and constructive in your discussions</p>
                <p>• Use clear, descriptive titles that explain your topic</p>
                <p>
                  • Include relevant details and context in your description
                </p>
                <p>• Choose the most appropriate category for your thread</p>
                <p>• Use tags to help others find your content</p>
                <p>• Search existing threads before creating new ones</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Tips for Better Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• Ask specific questions to get better answers</p>
                <p>• Include your location/region when relevant</p>
                <p>• Share your experience level with the topic</p>
                <p>• Add photos or examples when helpful</p>
                <p>• Follow up with updates on your situation</p>
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Popular Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

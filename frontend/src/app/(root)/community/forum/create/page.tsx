"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { ArrowLeft, Send, Upload, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GET_CATEGORIES, CREATE_THREAD_MUTATION, CREATE_POST_MUTATION } from "@/lib/graphql/queries";
import { Category } from "@/lib/graphql/types";

export default function CreateThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const [createThread] = useMutation(CREATE_THREAD_MUTATION);
  const [createPost] = useMutation(CREATE_POST_MUTATION);

  const categories: Category[] = categoriesData?.categories || [];

  const handleAddImage = () => {
    if (imageInput.trim() && !imageUrls.includes(imageInput.trim())) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput("");
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategory) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the thread first
      const threadResult = await createThread({
        variables: {
          input: {
            category_id: selectedCategory,
            title: title.trim()
          }
        }
      });

      const threadId = threadResult.data?.createThread.id;

      if (threadId) {
        // Create the initial post for the thread
        await createPost({
          variables: {
            input: {
              thread_id: threadId,
              content: content.trim(),
              image_urls: imageUrls
            }
          }
        });

        // Redirect to the new thread
        router.push(`/community/forum/thread/${threadId}`);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && content.trim() && selectedCategory;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/community/forum">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Thread
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Start a new discussion in the community
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thread Title */}
            <Card>
              <CardHeader>
                <CardTitle>Thread Details</CardTitle>
                <CardDescription>
                  Provide a clear and descriptive title for your thread
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Thread Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title for your thread..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Thread Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Write the main content of your thread
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Thread Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your thread content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px]"
                    required
                  />
                </div>

                {/* Image URLs */}
                <div className="space-y-2">
                  <Label>Images (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL..."
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImage}
                      disabled={!imageInput.trim()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Added images:
                      </p>
                      <div className="space-y-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="flex-1 text-sm truncate">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveImage(url)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Preview */}
            {selectedCategory && !categoriesLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const category = categories.find(c => c.id === selectedCategory);
                    return category ? (
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {category.description}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posting Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use a clear and descriptive title</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Choose the most appropriate category</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Provide detailed and helpful content</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Be respectful and constructive</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Search before posting to avoid duplicates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>Creating Thread...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Thread
                  </>
                )}
              </Button>
              <Link href="/community/forum">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

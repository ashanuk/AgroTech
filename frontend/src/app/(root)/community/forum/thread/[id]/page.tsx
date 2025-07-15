"use client";

import { useState } from "react";
  import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Reply,
  MoreVertical,
  Send,
  Upload,
  X,
  Lock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  GET_THREAD,
  GET_POSTS,
  CREATE_POST_MUTATION,
  LIKE_POST_MUTATION,
  UNLIKE_POST_MUTATION,
  DELETE_POST_MUTATION,
  GET_ME,
  UPLOAD_IMAGE_MUTATION,
} from "@/lib/graphql/queries";
import { Thread, Post, User } from "@/lib/graphql/types";

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

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

interface PostComponentProps {
  post: Post;
  currentUser?: User;
  onReply: (postId: string) => void;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onDelete: (postId: string) => void;
  isReply?: boolean;
}

function PostComponent({
  post,
  currentUser,
  onReply,
  onLike,
  onUnlike,
  onDelete,
  isReply = false,
}: PostComponentProps) {
  const isLiked = currentUser
    ? post.likes.some((user) => user.id === currentUser.id)
    : false;
  const canDelete = currentUser?.id === post.user.id;

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback>
                {post.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{post.user.username}</span>
                  {post.user.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at))}
                  </span>
                  {post.is_edited && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(post.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.image_urls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {post.image_urls.map((url, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={index}
                      src={url}
                      alt={`Post image ${index + 1}`}
                      className="rounded-lg max-w-full h-auto"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    isLiked ? onUnlike(post.id) : onLike(post.id)
                  }
                  className={isLiked ? "text-red-500" : ""}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                  />
                  {post.like_count}
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(post.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="ml-4">
          {post.replies.map((reply) => (
            <PostComponent
              key={reply.id}
              post={reply}
              currentUser={currentUser}
              onReply={onReply}
              onLike={onLike}
              onUnlike={onUnlike}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;

  const [replyContent, setReplyContent] = useState("");
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: meData } = useQuery(GET_ME, { errorPolicy: "ignore" });
  const { data: threadData, loading: threadLoading } = useQuery(GET_THREAD, {
    variables: { id: threadId },
    skip: !threadId,
  });

  const {
    data: postsData,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useQuery(GET_POSTS, {
    variables: { thread_id: threadId, limit: 50, offset: 0 },
    skip: !threadId,
  });

  const [createPost] = useMutation(CREATE_POST_MUTATION);
  const [likePost] = useMutation(LIKE_POST_MUTATION);
  const [unlikePost] = useMutation(UNLIKE_POST_MUTATION);
  const [deletePost] = useMutation(DELETE_POST_MUTATION);
  const [uploadImage] = useMutation(UPLOAD_IMAGE_MUTATION);

  const thread: Thread | undefined = threadData?.thread;
  const posts: Post[] = postsData?.posts || [];
  const currentUser: User | undefined = meData?.me;

  const handleAddImage = () => {
    if (imageInput.trim() && !imageUrls.includes(imageInput.trim())) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput("");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await uploadImage({
        variables: { file },
      });
      
      const imageUrl = result.data?.uploadImage;
      if (imageUrl) {
        setImageUrls([...imageUrls, imageUrl]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter((url) => url !== urlToRemove));
  };

  const handleReply = (postId: string) => {
    setReplyToPostId(postId);
    // Scroll to reply form
    document
      .getElementById("reply-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      alert("Please enter your reply");
      return;
    }

    if (!currentUser) {
      alert("Please log in to post a reply");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        variables: {
          input: {
            thread_id: threadId,
            content: replyContent.trim(),
            image_urls: imageUrls,
            parent_post_id: replyToPostId,
          },
        },
      });

      // Reset form
      setReplyContent("");
      setImageUrls([]);
      setReplyToPostId(null);

      // Refetch posts
      refetchPosts();
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      alert("Please log in to like posts");
      return;
    }

    try {
      await likePost({
        variables: { id: postId },
      });
      refetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async (postId: string) => {
    if (!currentUser) return;

    try {
      await unlikePost({
        variables: { id: postId },
      });
      refetchPosts();
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost({
        variables: { id: postId },
      });
      refetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  if (threadLoading || postsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Thread not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The thread you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
            <Link href="/community/forum">
              <Button className="mt-4">Back to Forum</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      </div>

      {/* Thread Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_locked && <Lock className="h-5 w-5 text-gray-500" />}
                <CardTitle className="text-2xl">{thread.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>by {thread.user.username}</span>
                <span>in {thread.category.name}</span>
                <span>{formatDistanceToNow(new Date(thread.created_at))}</span>
                <span>{thread.post_count || 0} replies</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4 mb-8">
        {posts.map((post) => (
          <PostComponent
            key={post.id}
            post={post}
            currentUser={currentUser}
            onReply={handleReply}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDelete={handleDelete}
          />
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to reply to this thread!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Form */}
      {!thread.is_locked && currentUser && (
        <Card id="reply-form">
          <CardHeader>
            <CardTitle className="text-lg">
              {replyToPostId ? "Reply to Post" : "Add Your Reply"}
            </CardTitle>
            {replyToPostId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyToPostId(null)}
                className="w-fit"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Reply
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[120px]"
                required
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddImage())
                    }
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

                {/* File Upload */}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && (
                    <div className="text-sm text-gray-500">Uploading...</div>
                  )}
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Images to include:</p>
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
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
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Login Prompt */}
      {!currentUser && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to participate in this discussion
            </p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Locked Thread Message */}
      {thread.is_locked && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4 text-center">
            <Lock className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-yellow-700 dark:text-yellow-300">
              This thread has been locked and no new replies can be added.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

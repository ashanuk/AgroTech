export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  created_at: string;
  last_active: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  thread_count?: number;
}

export interface Thread {
  id: string;
  category_id: string;
  category: Category;
  user_id: string;
  user: User;
  title: string;
  created_at: string;
  is_locked: boolean;
  last_updated: string;
  post_count?: number;
  latest_post?: Post;
}

export interface Post {
  id: string;
  thread_id: string;
  thread?: Thread;
  user_id: string;
  user: User;
  content: string;
  image_urls: string[];
  parent_post_id?: string;
  parent_post?: Post;
  created_at: string;
  is_edited: boolean;
  likes: User[];
  like_count: number;
  replies: Post[];
  reply_count: number;
}

export interface AuthPayload {
  token: string;
  user: User;
}

// Input Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
}

export interface CreateThreadInput {
  category_id: string;
  title: string;
}

export interface CreatePostInput {
  thread_id: string;
  content: string;
  image_urls?: string[];
  parent_post_id?: string;
}

export interface UpdatePostInput {
  content: string;
  image_urls?: string[];
}

// Query Variables
export interface GetThreadsVariables {
  category_id?: string;
  limit?: number;
  offset?: number;
}

export interface GetPostsVariables {
  thread_id: string;
  limit?: number;
  offset?: number;
}

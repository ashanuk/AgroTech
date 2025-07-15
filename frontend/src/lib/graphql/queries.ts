import { gql } from "@apollo/client";

// Auth Queries & Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        avatar_url
        bio
        is_verified
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        avatar_url
        bio
        is_verified
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      avatar_url
      bio
      is_verified
      created_at
      last_active
    }
  }
`;

// Category Queries & Mutations
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      created_at
      thread_count
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      created_at
      thread_count
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      created_at
      thread_count
    }
  }
`;

// Thread Queries & Mutations
export const GET_THREADS = gql`
  query GetThreads($category_id: String, $limit: Int, $offset: Int) {
    threads(category_id: $category_id, limit: $limit, offset: $offset) {
      id
      title
      created_at
      is_locked
      last_updated
      post_count
      category {
        id
        name
      }
      user {
        id
        username
        avatar_url
      }
      latest_post {
        id
        content
        created_at
        user {
          id
          username
        }
      }
    }
  }
`;

export const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      id
      title
      created_at
      is_locked
      last_updated
      post_count
      category {
        id
        name
      }
      user {
        id
        username
        avatar_url
      }
    }
  }
`;

export const CREATE_THREAD_MUTATION = gql`
  mutation CreateThread($input: CreateThreadInput!) {
    createThread(input: $input) {
      id
      title
      created_at
      is_locked
      category {
        id
        name
      }
      user {
        id
        username
        avatar_url
      }
    }
  }
`;

export const UPDATE_THREAD_MUTATION = gql`
  mutation UpdateThread($id: ID!, $title: String!) {
    updateThread(id: $id, title: $title) {
      id
      title
      last_updated
    }
  }
`;

export const DELETE_THREAD_MUTATION = gql`
  mutation DeleteThread($id: ID!) {
    deleteThread(id: $id)
  }
`;

export const LOCK_THREAD_MUTATION = gql`
  mutation LockThread($id: ID!) {
    lockThread(id: $id) {
      id
      is_locked
    }
  }
`;

export const UNLOCK_THREAD_MUTATION = gql`
  mutation UnlockThread($id: ID!) {
    unlockThread(id: $id) {
      id
      is_locked
    }
  }
`;

// Post Queries & Mutations
export const GET_POSTS = gql`
  query GetPosts($thread_id: String!, $limit: Int, $offset: Int) {
    posts(thread_id: $thread_id, limit: $limit, offset: $offset) {
      id
      content
      image_urls
      created_at
      is_edited
      like_count
      reply_count
      user {
        id
        username
        avatar_url
        is_verified
      }
      likes {
        id
        username
      }
      replies {
        id
        content
        image_urls
        created_at
        is_edited
        like_count
        user {
          id
          username
          avatar_url
          is_verified
        }
        likes {
          id
          username
        }
      }
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      content
      image_urls
      created_at
      is_edited
      like_count
      reply_count
      user {
        id
        username
        avatar_url
        is_verified
      }
      likes {
        id
        username
      }
      parent_post {
        id
        content
        user {
          id
          username
        }
      }
      replies {
        id
        content
        image_urls
        created_at
        is_edited
        like_count
        user {
          id
          username
          avatar_url
          is_verified
        }
        likes {
          id
          username
        }
      }
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      content
      image_urls
      created_at
      like_count
      reply_count
      user {
        id
        username
        avatar_url
        is_verified
      }
      likes {
        id
        username
      }
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      content
      image_urls
      is_edited
      like_count
      reply_count
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($id: ID!) {
    likePost(id: $id) {
      id
      like_count
      likes {
        id
        username
      }
    }
  }
`;

export const UNLIKE_POST_MUTATION = gql`
  mutation UnlikePost($id: ID!) {
    unlikePost(id: $id) {
      id
      like_count
      likes {
        id
        username
      }
    }
  }
`;

// User Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      avatar_url
      bio
      is_verified
      created_at
      last_active
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      email
      avatar_url
      bio
      is_verified
      created_at
      last_active
    }
  }
`;

// File Upload Mutation
export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file)
  }
`;

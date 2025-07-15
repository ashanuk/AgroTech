# AgroTech Forum Frontend Integration

This document describes the GraphQL-based forum integration in the AgroTech frontend application.

## Overview

The forum is built with:

- **Apollo Client** for GraphQL state management
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components

## Setup

### 1. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4001/graphql
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
MONGODB_URI=mongodb://localhost:27017/agrotech_forum
```

### 2. Dependencies

Required packages (already installed):

```json
{
  "@apollo/client": "^3.x",
  "graphql": "^16.x"
}
```

## File Structure

```
frontend/src/
├── app/(root)/community/forum/
│   ├── page.tsx                 # Forum main page
│   ├── create/page.tsx          # Create new thread
│   └── thread/[id]/page.tsx     # Thread view with posts
├── lib/graphql/
│   ├── queries.ts               # GraphQL queries & mutations
│   └── types.ts                 # TypeScript interfaces
├── lib/
│   └── apollo-client.ts         # Apollo Client configuration
└── providers/
    └── GraphQLProvider.tsx      # Apollo Provider wrapper
```

## Key Components

### 1. Forum Main Page (`/community/forum`)

**Features:**

- List all threads with pagination
- Filter by category
- Search functionality
- Thread creation button
- Category sidebar
- Real-time thread statistics

**Queries Used:**

- `GET_CATEGORIES` - Load all forum categories
- `GET_THREADS` - Load threads with optional category filter

### 2. Create Thread Page (`/community/forum/create`)

**Features:**

- Thread title and content input
- Category selection
- Multiple image URL support
- Form validation
- Real-time preview

**Mutations Used:**

- `CREATE_THREAD_MUTATION` - Create new thread
- `CREATE_POST_MUTATION` - Create initial post for thread

### 3. Thread View (`/community/forum/thread/[id]`)

**Features:**

- Display thread details and all posts
- Nested reply system
- Like/unlike functionality
- Post editing and deletion
- Image gallery support
- Real-time updates

**Queries & Mutations:**

- `GET_THREAD` - Load thread details
- `GET_POSTS` - Load all posts in thread
- `CREATE_POST_MUTATION` - Create replies
- `LIKE_POST_MUTATION` / `UNLIKE_POST_MUTATION` - Like system
- `DELETE_POST_MUTATION` - Delete posts

## GraphQL Integration

### Apollo Client Setup

```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### Example Queries

```typescript
// Get all categories
const { data, loading } = useQuery(GET_CATEGORIES);

// Get threads with filter
const { data, loading } = useQuery(GET_THREADS, {
  variables: {
    category_id: selectedCategory,
    limit: 20,
    offset: 0,
  },
});

// Create new thread
const [createThread] = useMutation(CREATE_THREAD_MUTATION);
const result = await createThread({
  variables: {
    input: {
      category_id: "category-id",
      title: "Thread Title",
    },
  },
});
```

## Authentication Integration

The forum integrates with the existing NextAuth system:

```typescript
// Get current user
const { data: meData } = useQuery(GET_ME, {
  errorPolicy: "ignore",
});

// Check if user is authenticated
const currentUser = meData?.me;
if (!currentUser) {
  // Show login prompt
}
```

## State Management

Apollo Client handles all state management:

- **Local Cache** for optimistic updates
- **Automatic Refetching** after mutations
- **Error Handling** with user-friendly messages
- **Loading States** for better UX

## TypeScript Types

All GraphQL types are defined in `lib/graphql/types.ts`:

```typescript
export interface Thread {
  id: string;
  title: string;
  category: Category;
  user: User;
  post_count: number;
  is_locked: boolean;
  created_at: string;
  last_updated: string;
}

export interface Post {
  id: string;
  content: string;
  image_urls: string[];
  user: User;
  likes: User[];
  replies: Post[];
  like_count: number;
  reply_count: number;
  created_at: string;
  is_edited: boolean;
}
```

## Features Implemented

### ✅ Core Features

- [x] View forum categories
- [x] List threads by category
- [x] Create new threads
- [x] View thread details
- [x] Post replies (including nested replies)
- [x] Like/unlike posts
- [x] Edit and delete posts
- [x] Image support in posts
- [x] Search functionality
- [x] User authentication integration

### ✅ UI/UX Features

- [x] Responsive design
- [x] Dark/light theme support
- [x] Loading states
- [x] Error handling
- [x] Form validation
- [x] Real-time updates
- [x] Optimistic updates

### ✅ Advanced Features

- [x] Thread locking
- [x] Post editing indicators
- [x] User verification badges
- [x] Relative timestamps
- [x] Image galleries
- [x] Category statistics

## Usage Examples

### Creating a New Thread

```typescript
const [createThread] = useMutation(CREATE_THREAD_MUTATION);
const [createPost] = useMutation(CREATE_POST_MUTATION);

const handleSubmit = async () => {
  // Create thread
  const threadResult = await createThread({
    variables: {
      input: {
        category_id: selectedCategory,
        title: title.trim(),
      },
    },
  });

  // Create initial post
  await createPost({
    variables: {
      input: {
        thread_id: threadResult.data.createThread.id,
        content: content.trim(),
        image_urls: imageUrls,
      },
    },
  });
};
```

### Posting a Reply

```typescript
const [createPost] = useMutation(CREATE_POST_MUTATION);

const handleReply = async () => {
  await createPost({
    variables: {
      input: {
        thread_id: threadId,
        content: replyContent.trim(),
        parent_post_id: parentPostId, // For nested replies
        image_urls: imageUrls,
      },
    },
  });

  // Refetch posts to show new reply
  refetchPosts();
};
```

### Liking a Post

```typescript
const [likePost] = useMutation(LIKE_POST_MUTATION);
const [unlikePost] = useMutation(UNLIKE_POST_MUTATION);

const handleLike = async (postId: string, isLiked: boolean) => {
  try {
    if (isLiked) {
      await unlikePost({ variables: { id: postId } });
    } else {
      await likePost({ variables: { id: postId } });
    }
    refetchPosts();
  } catch (error) {
    console.error("Error updating like:", error);
  }
};
```

## Performance Optimizations

1. **DataLoader** on backend for N+1 query prevention
2. **Apollo Cache** for client-side caching
3. **Pagination** for large data sets
4. **Image lazy loading** for better performance
5. **Optimistic updates** for immediate UI feedback

## Deployment Notes

1. Set correct `NEXT_PUBLIC_GRAPHQL_ENDPOINT` for production
2. Configure CORS on backend for production domain
3. Ensure JWT tokens are properly handled in production
4. Set up proper error monitoring
5. Consider CDN for image assets

## Testing

### Manual Testing Checklist

- [ ] Forum loads with categories
- [ ] Threads display correctly
- [ ] New thread creation works
- [ ] Posting replies works
- [ ] Like functionality works
- [ ] Authentication redirects work
- [ ] Image uploads display correctly
- [ ] Search filters work
- [ ] Responsive design works

### API Testing

Use GraphQL Playground at `http://localhost:4001/graphql` to test queries directly.

## Troubleshooting

### Common Issues

1. **GraphQL endpoint not reachable**

   - Check if backend server is running
   - Verify `NEXT_PUBLIC_GRAPHQL_ENDPOINT` in `.env.local`

2. **Authentication errors**

   - Check JWT token in localStorage
   - Verify user is logged in with NextAuth

3. **CORS errors**

   - Check backend CORS configuration
   - Verify frontend URL in backend `.env`

4. **Apollo Client errors**
   - Check browser network tab for GraphQL errors
   - Verify query structure matches schema

## Future Enhancements

- Real-time notifications with subscriptions
- File upload integration (images, documents)
- Advanced moderation tools
- Thread pinning and featured posts
- User reputation system
- Email notifications
- Mobile app support

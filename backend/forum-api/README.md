# AgroTech Forum API Documentation

A GraphQL-based forum API built with Apollo Server, Express, and MongoDB for the AgroTech platform.

## Features

- **GraphQL API** with Apollo Server
- **MongoDB** database with Mongoose ODM
- **JWT Authentication**
- **User Management** with registration and login
- **Forum Categories** for organizing discussions
- **Threaded Discussions** with nested replies
- **Post Management** with image support
- **Like System** for posts and replies
- **Thread Locking** functionality
- **DataLoader** for optimized database queries

## Tech Stack

- **Backend**: Node.js, Express.js, Apollo Server, GraphQL
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: URL-based (ready for cloud storage integration)
- **Development**: Nodemon for hot reloading

## Project Structure

```
backend/forum-api/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── loaders/
│   │   └── index.js             # DataLoader for optimized queries
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── Category.js          # Category schema
│   │   ├── Post.js              # Post schema
│   │   ├── Thread.js            # Thread schema
│   │   └── User.js              # User schema
│   ├── resolvers/
│   │   └── index.js             # GraphQL resolvers
│   ├── schema/
│   │   └── typeDefs.js          # GraphQL type definitions
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   └── index.js                 # Main server file
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend/forum-api
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/agrotech_forum

# Server
PORT=4001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Seed Database

```bash
npm run seed
```

This creates sample users, categories, threads, and posts.

**Sample Users:**

- Email: `john@example.com`, Password: `password123`
- Email: `expert@example.com`, Password: `password123`
- Email: `tech@example.com`, Password: `password123`

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at:

- **GraphQL Endpoint**: http://localhost:4001/graphql
- **GraphQL Playground**: http://localhost:4001/graphql

## API Documentation

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Operations

#### Authentication

```graphql
# Register a new user
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}

# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}
```

#### Categories

```graphql
# Get all categories
query GetCategories {
  categories {
    id
    name
    description
    thread_count
  }
}

# Create category (requires authentication)
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    description
  }
}
```

#### Threads

```graphql
# Get threads (optional category filter)
query GetThreads($category_id: String, $limit: Int, $offset: Int) {
  threads(category_id: $category_id, limit: $limit, offset: $offset) {
    id
    title
    created_at
    is_locked
    post_count
    category {
      id
      name
    }
    user {
      id
      username
    }
    latest_post {
      id
      content
      created_at
      user {
        username
      }
    }
  }
}

# Create thread (requires authentication)
mutation CreateThread($input: CreateThreadInput!) {
  createThread(input: $input) {
    id
    title
    created_at
    category {
      name
    }
    user {
      username
    }
  }
}
```

#### Posts

```graphql
# Get posts in a thread
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
    }
    replies {
      id
      content
      created_at
      user {
        username
      }
    }
  }
}

# Create post/reply (requires authentication)
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    content
    image_urls
    created_at
    user {
      username
    }
  }
}

# Like/Unlike posts
mutation LikePost($id: ID!) {
  likePost(id: $id) {
    id
    like_count
  }
}
```

## Database Schema

### Collections

#### Users

```javascript
{
  _id: ObjectId,
  username: String,     // Unique username
  email: String,        // Unique email
  password: String,     // Hashed password
  avatar_url: String,   // Optional profile picture
  bio: String,          // User bio
  is_verified: Boolean, // Verification status
  created_at: Date,
  last_active: Date
}
```

#### Categories

```javascript
{
  _id: ObjectId,
  name: String,         // Unique category name
  description: String,  // Category description
  created_at: Date
}
```

#### Threads

```javascript
{
  _id: ObjectId,
  category_id: ObjectId,  // Reference to Category
  user_id: ObjectId,      // Thread creator
  title: String,          // Thread title
  created_at: Date,
  is_locked: Boolean,     // Lock status
  last_updated: Date      // For sorting by recent activity
}
```

#### Posts

```javascript
{
  _id: ObjectId,
  thread_id: ObjectId,     // Reference to Thread
  user_id: ObjectId,       // Post author
  content: String,         // Post content
  image_urls: [String],    // Array of image URLs
  parent_post_id: ObjectId, // For nested replies (nullable)
  created_at: Date,
  is_edited: Boolean,
  likes: [ObjectId]        // Array of user IDs who liked
}
```

### Indexes

For optimal performance, the following indexes are created:

**Categories**: `name`
**Threads**: `category_id`, `user_id`, `last_updated`, `category_id + last_updated`
**Posts**: `thread_id`, `user_id`, `parent_post_id`, `thread_id + created_at`
**Users**: `email`, `username`

## Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Environment Variables

| Variable       | Description               | Default                                    |
| -------------- | ------------------------- | ------------------------------------------ |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://localhost:27017/agrotech_forum` |
| `PORT`         | Server port               | `4001`                                     |
| `NODE_ENV`     | Environment mode          | `development`                              |
| `JWT_SECRET`   | JWT signing secret        | Required                                   |
| `FRONTEND_URL` | Frontend URL for CORS     | `http://localhost:3000`                    |

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB
4. Set appropriate `FRONTEND_URL`
5. Consider rate limiting and security middleware

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 4001
CMD ["npm", "start"]
```

## Security Features

- **JWT Authentication** with token expiration
- **Password Hashing** using bcryptjs
- **Input Validation** with GraphQL schema
- **CORS Configuration** for cross-origin requests
- **Error Handling** with sanitized error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

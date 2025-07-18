# AgroTech Authentication System

This document explains the implemented authentication system that integrates NextAuth (for session management) with GraphQL JWT authentication (for API access).

## Overview

The authentication system uses a dual approach:

1. **NextAuth.js** - Handles session management, cookie-based authentication, and UI state
2. **GraphQL JWT** - Handles API authentication with the backend GraphQL server

## Architecture

```
Frontend (Next.js)           Backend (GraphQL/Node.js)
├── NextAuth Session         ├── JWT Token Verification
├── Apollo Client            ├── User Context
└── Local Storage Token      └── Protected Resolvers
```

## Implementation Details

### Frontend Components

1. **Apollo Client (`apollo-client.ts`)**

   - Automatically includes JWT token in Authorization header
   - Token stored in localStorage as `apollo-token`

2. **GraphQL Auth Utils (`graphql-auth.ts`)**

   - `graphQLLogin()` - Authenticate with GraphQL and store token
   - `graphQLRegister()` - Register new user with GraphQL
   - `graphQLLogout()` - Clear stored tokens
   - `getStoredToken()` - Get current JWT token

3. **Auth Hook (`use-auth.ts`)**

   - Manages authentication state
   - Syncs NextAuth session with GraphQL token
   - Provides unified user data

4. **Auth Sync Component (`auth-sync.tsx`)**
   - Keeps NextAuth and GraphQL authentication in sync
   - Handles token expiration and cleanup

### Backend Components

1. **Auth Middleware (`auth.js`)**

   - Verifies JWT tokens from Authorization header
   - Provides user context to GraphQL resolvers
   - Handles both development mock tokens and production JWT

2. **GraphQL Resolvers**
   - `register` mutation - Creates user and returns JWT
   - `login` mutation - Authenticates user and returns JWT
   - `me` query - Returns current user profile
   - Protected mutations require authentication

## Authentication Flow

### Registration

1. User fills registration form
2. Frontend calls `graphQLRegister()` with user data
3. GraphQL mutation creates user and returns JWT token
4. Token stored in localStorage
5. User redirected to login page

### Login

1. User fills login form
2. Frontend calls `graphQLLogin()` with credentials
3. GraphQL mutation validates credentials and returns JWT
4. JWT stored in localStorage
5. NextAuth `signIn()` called for session management
6. User redirected to dashboard

### Logout

1. User clicks logout
2. `graphQLLogout()` clears localStorage tokens
3. NextAuth `signOut()` clears session
4. User redirected to login page

### API Requests

1. Apollo Client automatically includes JWT in headers
2. Backend verifies token and provides user context
3. Protected resolvers check for authenticated user

## Configuration

### Frontend Environment Variables

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4001/graphql
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
MONGODB_URI=mongodb://localhost:27017/agrotech
```

### Backend Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/agrotech_forum
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
PORT=4001
NODE_ENV=development
```

## Security Features

1. **JWT Token Verification** - All API requests verified with JWT
2. **Secure Token Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
3. **Password Hashing** - bcrypt with salt rounds
4. **CORS Protection** - Configured for frontend domain only
5. **Error Handling** - Proper error messages without sensitive data

## Usage Examples

### Using the Auth Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Hello, {user?.name}!</div>;
}
```

### Making Authenticated GraphQL Requests

```tsx
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/lib/graphql/queries";

function Profile() {
  const { data, loading, error } = useQuery(GET_ME);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {data.me.username}!</div>;
}
```

## Testing

Use the test script to verify authentication:

```bash
cd backend/forum-api
node test-auth.js
```

## Production Considerations

1. **Environment Variables** - Use secure, unique values
2. **HTTPS** - Enable HTTPS for all environments
3. **Token Storage** - Consider httpOnly cookies instead of localStorage
4. **Token Expiration** - Implement refresh token mechanism
5. **Rate Limiting** - Add rate limiting for auth endpoints
6. **Monitoring** - Add authentication event logging

## Troubleshooting

### Common Issues

1. **"Not authenticated" errors**

   - Check if JWT token exists in localStorage
   - Verify token hasn't expired
   - Ensure GraphQL endpoint is correct

2. **CORS errors**

   - Verify FRONTEND_URL in backend env
   - Check browser network tab for exact error

3. **Token mismatch**
   - Clear localStorage and re-login
   - Check if JWT_SECRET matches between sessions

### Debug Commands

```bash
# Check localStorage tokens (browser console)
localStorage.getItem('apollo-token')
localStorage.getItem('apollo-user')

# Clear tokens
localStorage.removeItem('apollo-token')
localStorage.removeItem('apollo-user')
```

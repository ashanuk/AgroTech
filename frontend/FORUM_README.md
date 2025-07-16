# AgroTech Farmer Forum

A comprehensive forum-based discussion platform for farmers to connect, share knowledge, and discuss agricultural topics.

## Features

### Core Forum Features

- **Structured Discussions**: Organized into categories and threads
- **Search Functionality**: Find relevant discussions quickly
- **User Authentication**: Secure login/registration system
- **Rich Text Posts**: Create detailed posts with formatting
- **Threaded Replies**: Nested conversations and discussions
- **Like/Dislike System**: Community-driven content rating
- **Thread Categories**: Organized by agricultural topics
- **Tagging System**: Easy content discovery

### Categories

1. **General Discussion** - General farming topics
2. **Crop Management** - Planting, growing, and harvesting
3. **Pest & Disease Control** - Dealing with agricultural challenges
4. **Irrigation & Water Management** - Water usage and conservation
5. **Equipment & Technology** - Farm equipment and AgTech
6. **Market & Prices** - Market trends and pricing discussions
7. **Organic Farming** - Sustainable and organic practices
8. **Livestock** - Animal husbandry and management

### User Features

- **Profile Management**: User profiles with post history
- **Activity Tracking**: Track likes, replies, and contributions
- **Reputation System**: Build credibility in the community
- **Notifications**: Stay updated on thread activity
- **Moderation Tools**: Report inappropriate content

## Technical Implementation

### Frontend Structure

```
src/app/(root)/community/forum/
├── page.tsx                 # Main forum listing page
├── create/
│   └── page.tsx            # Create new thread page
└── thread/
    └── [id]/
        └── page.tsx        # Individual thread view
```

### API Endpoints

```
/api/forum/threads/         # GET: List threads, POST: Create thread
/api/forum/threads/[id]     # GET: Get thread, PUT: Update thread
/api/forum/replies/         # POST: Create reply, PUT: Update reply
```

### Database Schema

#### forum_threads Collection

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  category: String,
  tags: [String],
  author: {
    id: String,
    name: String,
    avatar: String
  },
  createdAt: Date,
  lastActivity: Date,
  views: Number,
  likes: Number,
  dislikes: Number,
  replyCount: Number,
  isSticky: Boolean,
  isLocked: Boolean
}
```

#### forum_replies Collection

```javascript
{
  _id: ObjectId,
  threadId: String,
  content: String,
  parentReplyId: String, // For nested replies
  author: {
    id: String,
    name: String,
    avatar: String
  },
  createdAt: Date,
  likes: Number,
  dislikes: Number
}
```

#### forum_user_actions Collection

```javascript
{
  _id: ObjectId,
  userId: String,
  threadId: String,
  replyId: String,
  type: String, // 'thread' or 'reply'
  action: String, // 'like' or 'dislike'
  createdAt: Date
}
```

## Usage Guide

### For Farmers

1. **Browse Discussions**: Navigate through categories to find relevant topics
2. **Search**: Use the search bar to find specific discussions
3. **Create Threads**: Start new discussions about farming topics
4. **Reply to Posts**: Share your knowledge and ask questions
5. **Like/Dislike**: Help the community identify valuable content
6. **Follow Tags**: Stay updated on topics you're interested in

### For Moderators

1. **Pin Important Threads**: Make important discussions sticky
2. **Lock Threads**: Prevent new replies on resolved or inappropriate topics
3. **Moderate Content**: Review and manage community content
4. **User Management**: Handle user reports and violations

## Installation and Setup

1. **Prerequisites**:

   - Node.js 18+
   - MongoDB database
   - Next.js 14+

2. **Environment Variables**:

   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

3. **Database Setup**:

   - Create collections: `forum_threads`, `forum_replies`, `forum_user_actions`
   - Set up indexes for better performance

4. **Run the Application**:
   ```bash
   npm install
   npm run dev
   ```

## Features in Development

- [ ] **Image Uploads**: Add photos to threads and replies
- [ ] **User Mentions**: Tag other users in discussions
- [ ] **Email Notifications**: Get notified about thread activity
- [ ] **Advanced Search**: Filter by date, user, and more
- [ ] **Mobile App**: Native mobile application
- [ ] **Expert Verification**: Verified expert badges
- [ ] **Marketplace Integration**: Link to buy/sell section
- [ ] **Weather Integration**: Context-aware discussions

## Security Features

- **Authentication**: Secure user login and registration
- **Authorization**: Role-based access control
- **Input Validation**: Prevent XSS and injection attacks
- **Rate Limiting**: Prevent spam and abuse
- **Content Moderation**: Community reporting system

## Performance Optimizations

- **Database Indexing**: Optimized queries for fast search
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient loading of large datasets
- **Image Optimization**: Compressed images and CDN delivery
- **Lazy Loading**: Load content as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For technical support or feature requests:

- Email: support@agrotech.com
- GitHub Issues: Create an issue in the repository
- Community Forum: Ask questions in the General Discussion category

## License

MIT License - See LICENSE file for details

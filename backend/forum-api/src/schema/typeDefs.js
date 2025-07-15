const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    avatar_url: String
    bio: String
    is_verified: Boolean!
    created_at: String!
    last_active: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String!
    created_at: String!
    thread_count: Int
  }

  type Thread {
    id: ID!
    category_id: String!
    category: Category!
    user_id: String!
    user: User!
    title: String!
    created_at: String!
    is_locked: Boolean!
    last_updated: String!
    post_count: Int
    latest_post: Post
  }

  type Post {
    id: ID!
    thread_id: String!
    thread: Thread!
    user_id: String!
    user: User!
    content: String!
    image_urls: [String!]!
    parent_post_id: String
    parent_post: Post
    created_at: String!
    is_edited: Boolean!
    likes: [User!]!
    like_count: Int!
    replies: [Post!]!
    reply_count: Int!
  }

  input CreateCategoryInput {
    name: String!
    description: String!
  }

  input CreateThreadInput {
    category_id: String!
    title: String!
  }

  input CreatePostInput {
    thread_id: String!
    content: String!
    image_urls: [String!]
    parent_post_id: String
  }

  input UpdatePostInput {
    content: String!
    image_urls: [String!]
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Categories
    categories: [Category!]!
    category(id: ID!): Category

    # Threads
    threads(category_id: String, limit: Int, offset: Int): [Thread!]!
    thread(id: ID!): Thread

    # Posts
    posts(thread_id: String!, limit: Int, offset: Int): [Post!]!
    post(id: ID!): Post
    replies(parent_post_id: String!): [Post!]!

    # Users
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Categories
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: CreateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Threads
    createThread(input: CreateThreadInput!): Thread!
    updateThread(id: ID!, title: String!): Thread!
    deleteThread(id: ID!): Boolean!
    lockThread(id: ID!): Thread!
    unlockThread(id: ID!): Thread!

    # Posts
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    likePost(id: ID!): Post!
    unlikePost(id: ID!): Post!

    # File upload
    uploadImage(file: Upload!): String!
  }

  scalar Upload
`;

module.exports = typeDefs;

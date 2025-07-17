const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    name: String
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

  type Location {
    type: String!
    coordinates: [Float!]!
  }

  type Product {
    id: ID!
    farmerId: String!
    farmer: User!
    title: String!
    description: String!
    cropType: String!
    pricePerKg: Float!
    totalQuantityKg: Float!
    availableQuantityKg: Float!
    unit: String!
    images: [String!]!
    location: Location
    address: String
    createdAt: String!
    updatedAt: String!
    replies: [Post!]!
    reply_count: Int!
  }

  type Reservation {
    id: ID!
    buyerId: String!
    buyer: User!
    productId: String!
    product: Product!
    quantityKg: Float!
    status: String!
    reservedAt: String!
    fulfilledAt: String
    updatedAt: String!
    canCancel: Boolean!
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

  input LocationInput {
    type: String!
    coordinates: [Float!]!
  }

  input CreateProductInput {
    farmerId: String!
    title: String!
    description: String!
    cropType: String!
    pricePerKg: Float!
    totalQuantityKg: Float!
    availableQuantityKg: Float!
    unit: String!
    images: [String!]
    location: LocationInput
    address: String
  }

  input UpdateProductInput {
    title: String
    description: String
    cropType: String
    pricePerKg: Float
    totalQuantityKg: Float
    availableQuantityKg: Float
    unit: String
    images: [String!]
    location: LocationInput
    address: String
  }

  input CreateReservationInput {
    productId: String!
    quantityKg: Float!
  }

  input RegisterInput {
    username: String!
    name: String
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

    # Products
    products(limit: Int, offset: Int, cropType: String, farmerId: String): [Product!]!
    product(id: ID!): Product
    searchProducts(query: String!, limit: Int, offset: Int): [Product!]!
    searchProductSuggestions(query: String!, limit: Int): [String!]!
    nearbyProducts(longitude: Float!, latitude: Float!, maxDistance: Float, limit: Int): [Product!]!

    # Reservations
    reservations(buyerId: String, status: String): [Reservation!]!
    reservation(id: ID!): Reservation
    myReservations: [Reservation!]!
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

    # Products
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Reservations
    createReservation(input: CreateReservationInput!): Reservation!
    cancelReservation(id: ID!): Reservation!
    fulfillReservation(id: ID!): Reservation!
  }
`;

module.exports = typeDefs;

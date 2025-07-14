import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './user';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IProduct extends Document {
  farmerId: Schema.Types.ObjectId | IUser; // reference to User
  title: string; // e.g., "Red Bananas"
  description: string;
  cropType: string; // e.g., "vegetable", "fruit", "grain"
  pricePerKg: number;
  totalQuantityKg: number;
  availableQuantityKg: number;
  unit: string; // "kg", "ton", etc.
  images: string[]; // image URLs or file references
  location?: ILocation; // optional (for delivery, pickup)
  createdAt: Date;
  updatedAt: Date;
  address?: string; // optional human-readable address
}

const ProductSchema: Schema<IProduct> = new Schema({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuantityKg: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantityKg: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  images: [{
    type: String,
    required: false
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  address: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for common queries
ProductSchema.index({ farmerId: 1 });
ProductSchema.index({ cropType: 1 });
ProductSchema.index({ pricePerKg: 1 });
ProductSchema.index({ createdAt: -1 }); // For sorting by newest products first
ProductSchema.index({ title: 'text', description: 'text' }); // For text search

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMarketItem {
  name: string;
  unit: string;
  price: number;
  category?: string;
  quality?: 'premium' | 'standard' | 'economy';
  availability?: 'high' | 'medium' | 'low';
}

export interface IMarket extends Document {
  market: string;  // This matches your database field
 
  location?: string;
  district?: string;
  type?: 'wholesale' | 'retail' | 'farmers';
  items: IMarketItem[];
  date: Date | string;  // Can be Date object or string
  createdAt?: Date;
  updatedAt?: Date;
}

const MarketItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    trim: true
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'economy'],
    default: 'standard'
  },
  availability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'high'
  }
});

const MarketSchema: Schema<IMarket> = new Schema({
  market: {
    type: String,
    required: true,
    trim: true
  },
 
  location: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['wholesale', 'retail', 'farmers'],
    default: 'wholesale'
  },
  items: [MarketItemSchema],
  date: {
    type: Schema.Types.Mixed,  // Allow both Date and String
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false  // Allow additional fields from your database
});

// Create indexes for better query performance
MarketSchema.index({ market: 1, date: -1 });

MarketSchema.index({ district: 1 });
MarketSchema.index({ date: -1 });

const Market: Model<IMarket> = mongoose.models.Market || mongoose.model<IMarket>('Market', MarketSchema);

export default Market;

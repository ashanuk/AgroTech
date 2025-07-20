const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
    type: String
  }],
  location: {
    type: locationSchema,
    required: false
  },
  address: {
    type: String,
    required: false
  }
}, {
  timestamps: true // This creates createdAt and updatedAt automatically
});

// Create index for geospatial queries
productSchema.index({ location: '2dsphere' });

// Create text index for search functionality
productSchema.index({ 
  title: 'text', 
  description: 'text', 
  cropType: 'text' 
});

module.exports = mongoose.model('Product', productSchema);

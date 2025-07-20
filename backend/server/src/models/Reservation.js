const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantityKg: {
    type: Number,
    required: true,
    min: 0.1
  },
  status: {
    type: String,
    enum: ["reserved", "fulfilled", "cancelled"],
    default: "reserved"
  },
  reservedAt: {
    type: Date,
    default: Date.now
  },
  fulfilledAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
reservationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);

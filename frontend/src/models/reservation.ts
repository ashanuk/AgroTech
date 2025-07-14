import { Schema, model, models, Document, Model } from 'mongoose';
import { IUser } from './user';
import { IProduct } from './product';

export interface IReservation extends Document {
  buyerId: Schema.Types.ObjectId | IUser; // reference to User
  productId: Schema.Types.ObjectId | IProduct; // reference to Crop
  quantityKg: number;
  status: 'reserved' | 'cancelled' | 'fulfilled'; // "reserved", "cancelled", "fulfilled"
  reservedAt: Date;
  fulfilledAt?: Date; // optional
}

const ReservationSchema: Schema<IReservation> = new Schema({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  quantityKg: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['reserved', 'cancelled', 'fulfilled'],
    default: 'reserved'
  },
  reservedAt: {
    type: Date,
    default: Date.now
  },
  fulfilledAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for common queries
ReservationSchema.index({ buyerId: 1 });
ReservationSchema.index({ cropId: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ reservedAt: -1 }); // For sorting by newest reservations first

const Reservation: Model<IReservation> = models.Reservation || model<IReservation>("Reservation", ReservationSchema);

export default Reservation;

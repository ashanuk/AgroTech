import mongoose, { Document, Model, Schema } from 'mongoose';

interface ILocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    location?: ILocation;
    address?: string; // Human readable address from location
    username?: string;
    phone?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
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
    },
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'admin', 'farmer', 'expert']
    },
}, {
    timestamps: true // This automatically adds createdAt and updatedAt
})

// UserSchema.index({ email:1 });
// UserSchema.index({ username:1 });
// UserSchema.index( { location: '2dsphere' });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
export type { IUser, ILocation };
import mongoose, { Document, Model, Schema } from 'mongoose';

interface TemperatureRange {
    min: number;
    max: number;
}

interface PhRange {
    min: number;
    max: number;
}

interface ICrop extends Document {
    id: number;
    name: string;
    type: string;
    scientificName: string;
    suitability: number;
    plantingTime: string;
    harvestTime: string;
    waterRequirement: string;
    temperatureRange?: TemperatureRange;
    phRange?: PhRange;
    image?: string;
    description: string;
    detailedInstructions: Record<string, any>; // Allow flexibility here
}

const CropSchema: Schema<ICrop> = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    scientificName: {
        type: String,
        required: true
    },
    suitability: {
        type: Number,
        required: true
    },
    plantingTime: {
        type: String,
        required: true
    },
    harvestTime: {
        type: String,
        required: true
    },
    waterRequirement: {
        type: String,
        required: true
    },
    temperatureRange: {
        min: { type: Number },
        max: { type: Number }
    },
    phRange: {
        min: { type: Number },
        max: { type: Number }
    },
    image: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    detailedInstructions: {
        type: mongoose.Schema.Types.Mixed, // Allow flexible nested data
        required: true
    }
}, {
    timestamps: true
});

const Crop: Model<ICrop> = mongoose.models.Crop || mongoose.model<ICrop>("Crop", CropSchema);

export default Crop;
export type { ICrop };

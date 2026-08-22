/*
 * ServiceProvider Model
 * 
 * Represents a repair shop/professional. These are pre-seeded in the database
 * (not user-created) and discovered based on the user's location.
 * 
 * Key fields:
 * - location: lat/lng coordinates for distance calculation (Haversine formula)
 * - category: matches RepairRequest categories so shops are filtered by item type
 * - specialties: detailed list of what the shop can repair
 * - priceRange: budget indicator (one = cheap, three = expensive)
 * - reviews: sub-schema for future community reviews feature
 */import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview {
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IServiceProvider extends Document {
  name: string;
  category: "electronics" | "furniture" | "bicycle" | "appliance" | "other";
  address: string;
  city: string;
  state: string;
  location: { lat: number; lng: number };
  phone: string;
  rating: number;
  reviews: IReview[];
  specialties: string[];
  priceRange: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the MongoDB schema for repair shop data
const ServiceProviderSchema = new Schema<IServiceProvider>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["electronics", "furniture", "bicycle", "appliance", "other"],
      required: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    // Geographic coordinates for proximity-based sorting
    // Used by the Haversine formula in the services API
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    specialties: {
      type: [String],
      default: [],
    },
    priceRange: {
      type: String,
      default: "$",
    },
  },
  {
    timestamps: true,
  }
);

const ServiceProvider: Model<IServiceProvider> =
  mongoose.models.ServiceProvider || mongoose.model<IServiceProvider>("ServiceProvider", ServiceProviderSchema);

export default ServiceProvider;

import mongoose, { Schema, Document, Model } from "mongoose";

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
  phone: string;
  rating: number;
  reviews: IReview[];
  specialties: string[];
  priceRange: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  mongoose.models.ServiceProvider ||
  mongoose.model<IServiceProvider>("ServiceProvider", ServiceProviderSchema);

export default ServiceProvider;

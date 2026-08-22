/*
 * User Model
 * 
 * Stores user account information. Each user has:
 * - Basic profile (name, email)
 * - Hashed password (never returned in queries by default via select: false)
 * - Gamification (badges earned, total CO2 saved)
 * 
 * The password field has "select: false" which means it's excluded from
 * all queries unless explicitly requested with .select("+password").
 * This prevents accidental password leaks in API responses.
 */import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  badges: string[];
  totalCO2Saved: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    image: {
      type: String,
      default: null,
    },
    badges: {
      type: [String],
      default: [],
    },
    totalCO2Saved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

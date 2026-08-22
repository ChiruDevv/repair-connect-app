import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiagnosis {
  problem: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  repairScore: number;
  worthRepairing: boolean;
  estimatedRepairCost: number;
  estimatedReplaceCost: number;
}

export interface IImpact {
  co2Saved: number;
  waterSaved: number;
  wastePrevented: number;
}

export interface IDIYGuide {
  difficulty: "Beginner" | "Intermediate" | "Expert";
  estimatedTime: string;
  tools: string[];
  steps: string[];
  safetyNotes: string;
}

export interface IRepairRequest extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  videoUrl?: string;
  description: string;
  category: "electronics" | "furniture" | "bicycle" | "appliance" | "other";
  diagnosis: IDiagnosis;
  impact: IImpact;
  diyGuide: IDIYGuide;
  suggestedServices: mongoose.Types.ObjectId[];
  status: "pending" | "diagnosed" | "connected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const RepairRequestSchema = new Schema<IRepairRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ["electronics", "furniture", "bicycle", "appliance", "other"],
      required: true,
    },
    diagnosis: {
      problem: { type: String, default: "" },
      severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Low",
      },
      repairScore: { type: Number, default: 0 },
      worthRepairing: { type: Boolean, default: false },
      estimatedRepairCost: { type: Number, default: 0 },
      estimatedReplaceCost: { type: Number, default: 0 },
    },
    impact: {
      co2Saved: { type: Number, default: 0 },
      waterSaved: { type: Number, default: 0 },
      wastePrevented: { type: Number, default: 0 },
    },
    diyGuide: {
      difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
        default: "Beginner",
      },
      estimatedTime: { type: String, default: "" },
      tools: { type: [String], default: [] },
      steps: { type: [String], default: [] },
      safetyNotes: { type: String, default: "" },
    },
    suggestedServices: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "diagnosed", "connected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const RepairRequest: Model<IRepairRequest> =
  mongoose.models.RepairRequest ||
  mongoose.model<IRepairRequest>("RepairRequest", RepairRequestSchema);

export default RepairRequest;

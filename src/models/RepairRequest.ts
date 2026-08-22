/*
 * RepairRequest Model
 * 
 * This is the CORE data model of the application. Each repair request represents
 * a broken item that a user uploaded for AI diagnosis.
 * 
 * The model stores:
 * - User's input: image URL, description, category
 * - AI-generated diagnosis: problem, severity, repair score, cost estimates
 * - AI-generated guides: DIY steps, spare parts, repair options
 * - Environmental impact: CO2, water, waste saved if repaired
 * - Status tracking: diagnosed -> in_repair -> completed -> abandoned
 * 
 * The AI (GPT) returns all the diagnosis/guide data as structured JSON,
 * which is parsed and stored directly in this document.
 */import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISparePart {
  name: string;
  estimatedCost: number;
  availableAt: string;
  link: string;
}

export interface IRepairOption {
  option: string;
  estimatedCost: number;
  timeEstimate: string;
  pros: string;
  cons: string;
}

export interface IRepairRequest extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  description: string;
  category: string;
  diagnosis: {
    problem: string;
    severity: string;
    repairScore: number;
    worthRepairing: boolean;
    estimatedRepairCost: number;
    estimatedReplaceCost: number;
  };
  impact: {
    co2Saved: number;
    waterSaved: number;
    wastePrevented: number;
  };
  diyGuide: {
    difficulty: string;
    estimatedTime: string;
    tools: string[];
    steps: string[];
    safetyNotes: string;
  };
  spareParts: ISparePart[];
  repairOptions: IRepairOption[];
  status: "pending" | "diagnosed" | "in_repair" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

// Define the MongoDB schema with field types and validation
const RepairRequestSchema = new Schema<IRepairRequest>(
  {
    // Reference to the User who created this request
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    // Category determines which repair shops are relevant for this item
    category: {
      type: String,
      enum: ["electronics", "furniture", "bicycle", "appliance", "other"],
      required: true,
    },
    diagnosis: {
      problem: String,
      severity: String,
      repairScore: Number,
      worthRepairing: Boolean,
      estimatedRepairCost: Number,
      estimatedReplaceCost: Number,
    },
    impact: {
      co2Saved: Number,
      waterSaved: Number,
      wastePrevented: Number,
    },
    diyGuide: {
      difficulty: String,
      estimatedTime: String,
      tools: [String],
      steps: [String],
      safetyNotes: String,
    },
    spareParts: [
      {
        name: String,
        estimatedCost: Number,
        availableAt: String,
        link: String,
      },
    ],
    repairOptions: [
      {
        option: String,
        estimatedCost: Number,
        timeEstimate: String,
        pros: String,
        cons: String,
      },
    ],
    // Status tracks the repair journey from diagnosis to completion
    status: {
      type: String,
      enum: ["pending", "diagnosed", "in_repair", "completed", "abandoned"],
      default: "diagnosed",
    },
  },
  { timestamps: true }
);

const RepairRequest: Model<IRepairRequest> =
  mongoose.models.RepairRequest || mongoose.model<IRepairRequest>("RepairRequest", RepairRequestSchema);

export default RepairRequest;

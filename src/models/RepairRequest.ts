import mongoose, { Schema, Document, Model } from "mongoose";

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

const RepairRequestSchema = new Schema<IRepairRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
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

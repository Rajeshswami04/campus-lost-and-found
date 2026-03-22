import mongoose from "mongoose";
import { ITEM_CATEGORIES, LOST_ITEM_STATUSES } from "@/lib/campus-config";

const lostItemSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Item description is required"],
    },

    category: {
      type: String,
      enum: ITEM_CATEGORIES,
      required: true,
      index: true,
    },

    itemCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String, // image URLs
      },
    ],

    lostLocation: {
      type: String,
      required: true,
      trim: true,
    },

    // campusZone: {
    //   type: String,
    //   trim: true,
    // },

    lostDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: LOST_ITEM_STATUSES,
      default: "open",
      index: true,
    },

    proofHints: [
      {
        type: String,
        trim: true,
      },
    ],

    matchedFoundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoundItem",
      index: true,
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    adminNotes: {
      type: String,
      trim: true,
    },
    
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

lostItemSchema.index({ reporter: 1, status: 1, createdAt: -1 });
lostItemSchema.index({ category: 1, lostDate: -1 });

const LostItem =
  mongoose.models.LostItem || mongoose.model("LostItem", lostItemSchema);

export default LostItem;

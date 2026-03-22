import mongoose from "mongoose";
import {
  FOUND_ITEM_STATUSES,
  HOLDER_TYPES,
  ITEM_CATEGORIES,
} from "@/lib/campus-config";

const foundItemSchema = new mongoose.Schema(
  {
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Finder is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: true,
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
      sparse: true, // searching will be better if two have same itemcode it rejects else allows
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
        type: String,
      },
    ],

    foundLocation: {
      type: String,
      required: true,
      trim: true,
    },

    storageLocation: {
      type: String,
      trim: true,
    },

    foundDate: {
      type: Date,
      required: true,
    },

    currentHolder: {
      type: String,
      enum: HOLDER_TYPES,
      default: "finder",
    },

    holderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: FOUND_ITEM_STATUSES,
      default: "available",
      index: true,
    },

    matchedLostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostItem",
      index: true,
    },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verificationQuestions: [
      {
        type: String,
        trim: true,
      },
    ],

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
 
    returnedAt: {
      type: Date,
    },

    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

foundItemSchema.index({ finder: 1, status: 1, createdAt: -1 });
foundItemSchema.index({ category: 1, foundDate: -1 });

const FoundItem =
  mongoose.models.FoundItem || mongoose.model("FoundItem", foundItemSchema);

export default FoundItem;

// cmomplex indexs
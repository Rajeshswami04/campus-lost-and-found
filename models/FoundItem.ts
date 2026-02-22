import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema(
  {
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
      enum: [
        "Electronics",
        "Documents",
        "Clothing",
        "Accessories",
        "Books",
        "idcard",
      ],
      required: true,
      index: true,
    },

    images: [
      {
        type: String,
      },
    ],

    foundLocation: {
      type: String,
      required: true,
    },

    foundDate: {
      type: Date,
      required: true,
    },
    currentHolder: {
      type: String,
      enum: ["finder", "admin", "security"],
      default: "finder",
    },

    status: {
      type: String,
      enum: ["available", "claimed", "returned"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

const FoundItem =
  mongoose.models.FoundItem || mongoose.model("FoundItem", foundItemSchema);

export default FoundItem;

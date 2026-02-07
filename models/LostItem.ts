import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
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
      enum: [
        "Electronics",
        "Documents",
        "Clothing",
        "Accessories",
        "Books",
        "Others",
      ],
      required: true,
      index: true,
    },

    images: [
      {
        type: String, // image URLs
      },
    ],

    lostLocation: {
      type: String,
      required: true,
    },

    lostDate: {
      type: Date,
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "matched", "resolved"],
      default: "open",
      index: true,
    },

    matchedFoundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoundItem",
    },
  },
  { timestamps: true }
);

const LostItem =
  mongoose.models.LostItem || mongoose.model("LostItem", lostItemSchema);

export default LostItem;

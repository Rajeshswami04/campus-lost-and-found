import mongoose from "mongoose";

import { CLAIM_STATUSES } from "@/lib/campus-config";

const claimSchema = new mongoose.Schema(
    {
        foundItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoundItem",
            required: true,
            index: true,
        },
        claimant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        answers: [
            {
                question: {
                    type: String,
                    required: true,
                    trim: true,
                },
                answer: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],
        message: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: CLAIM_STATUSES,
            default: "pending",
            index: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewNote: {
            type: String,
            trim: true,
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);
claimSchema.index({ claimant: 1, createdAt: -1 });
claimSchema.index({ foundItem: 1, status: 1 });

const Claim = mongoose.models.Claim || mongoose.model("Claim", claimSchema);

export default Claim;


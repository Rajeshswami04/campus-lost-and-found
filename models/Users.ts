import mongoose from "mongoose";
import { USER_ACCOUNT_STATUSES, USER_ROLES } from "@/lib/campus-config";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },

    ID: {
      type: String,
      required: [true, "ID  is required"],
      unique: true,
      uppercase: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "College email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)?ac\.in$/,
        "Please use a valid college email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: true, // important for security
    },

    avatar: {
      type: String, // profile image URL
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
      index: true,
    },

    accountStatus: {
      type: String,
      enum: USER_ACCOUNT_STATUSES,
      default: "active",
      index: true,
    },

    department: {
      type: String,
      trim: true,
    },

    yearOfStudy: {
      type: Number,
      min: 1,
      max: 4,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    hostelOrBlock: {
      type: String,
      trim: true,
    },

    reputation: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: String,
    verifyTokenExpiry: Date,

    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;

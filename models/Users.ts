import mongoose from "mongoose";

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

    reputation: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
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

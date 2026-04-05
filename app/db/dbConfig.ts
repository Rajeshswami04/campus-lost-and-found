import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("mongo db connected", mongoose.connection.host);
  } catch (error) {
    console.log("error in dbconfig");
    console.log(error);
  }
}

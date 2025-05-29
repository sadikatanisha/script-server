import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI as string).then(() => {
      console.log("Connected to MongoDB");
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

export default connectDB;

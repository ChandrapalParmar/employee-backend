import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const connectToDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000, // Increased to 15s
      });
      console.log("✅ Connected to MongoDB");
      return;
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      retries -= 1;
      if (retries === 0) {
        console.error("❌ Max retries reached. Exiting...");
        process.exit(1);
      }
      console.log(`Retrying connection... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s before retry
    }
  }
};

export default connectToDatabase
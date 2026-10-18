import mongoose from "mongoose";

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "gemlink",
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB Atlas connected");
}

export default connectDB;
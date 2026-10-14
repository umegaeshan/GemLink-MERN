import express from "express";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GemLink API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);

export default app;
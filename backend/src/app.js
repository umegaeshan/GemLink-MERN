import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GemLink API is running",
  });
});

app.use("/api/auth", authRoutes);

export default app;
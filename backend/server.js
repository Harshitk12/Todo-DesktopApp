import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
console.log(process.env.ATLAS_PASSWORD)
const MONGO_URI = `mongodb+srv://harshitk5454:${process.env.ATLAS_PASSWORD}@cluster0.wei8nwv.mongodb.net/Todo` ;

const allowedOrigins = [
  "http://localhost:5173",
  "https://todo1-murex.vercel.app/"
];

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

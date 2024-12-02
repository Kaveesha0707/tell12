import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config(); // Load environment variables from .env

// MongoDB connection
let isConnected = false; // To track connection state

const connectToDatabase = async () => {
  if (isConnected) return; // Skip if already connected

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw new Error("Database connection failed");
  }
};

// Keyword schema and model
const keywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  frequency: { type: Number, default: 0 },
});

const Keyword = mongoose.models.Keyword || mongoose.model("Keyword", keywordSchema);

// Express app
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Routes for `api/keywords`
app.get("/api/keywords", async (req, res) => {
  try {
    await connectToDatabase();
    const keywords = await Keyword.find();
    res.status(200).json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/keywords", async (req, res) => {
  try {
    await connectToDatabase();
    const { keyword } = req.body;

    const existingKeyword = await Keyword.findOne({ keyword });
    if (existingKeyword) {
      return res.status(400).send("Keyword already exists.");
    }

    const newKeyword = new Keyword({ keyword });
    await newKeyword.save();
    res.status(201).json(newKeyword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/keywords/:id", async (req, res) => {
  try {
    await connectToDatabase();
    const { id } = req.params;

    const deletedKeyword = await Keyword.findByIdAndDelete(id);
    if (!deletedKeyword) {
      return res.status(404).send("Keyword not found.");
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the handler for Vercel
export default app;

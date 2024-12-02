import mongoose from "mongoose";
import Cors from "cors";

// Middleware to enable CORS
const cors = Cors({
  methods: ["GET", "POST", "DELETE"],
});

// Helper to handle middleware in Vercel's environment
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// MongoDB connection
const connectToDatabase = async () => {
  if (mongoose.connection.readyState) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection failed");
  }
};

// Define the schema and model
const channelSchema = new mongoose.Schema({
  channel_id: { type: String, required: true },
  alertCount: { type: Number, default: 0 },
});

const Channel = mongoose.models.Channel || mongoose.model("Channel", channelSchema);

export default async function handler(req, res) {
  await runMiddleware(req, res, cors); // Apply CORS middleware

  await connectToDatabase(); // Ensure DB connection

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const channels = await Channel.find();
        res.status(200).json(channels);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;

    case "POST":
      try {
        const { channel_id } = req.body;

        if (!channel_id) return res.status(400).json({ error: "Channel ID is required" });

        const existingChannel = await Channel.findOne({ channel_id });
        if (existingChannel) return res.status(400).json({ error: "Channel ID already exists" });

        const newChannel = new Channel({ channel_id });
        await newChannel.save();

        res.status(201).json(newChannel);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID is required" });

        const deletedChannel = await Channel.findByIdAndDelete(id);
        if (!deletedChannel) return res.status(404).json({ error: "Channel not found" });

        res.status(204).send();
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

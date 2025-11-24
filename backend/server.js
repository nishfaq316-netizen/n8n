import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Change to your frontend URL in production (Vercel)
const FRONTEND_ORIGIN = "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// n8n Webhook URL
const N8N_WEBHOOK_URL = "https://auto.robogrowthpartners.com/webhook/proposal-form";

app.post("/api/proposals", async (req, res) => {
  try {
    const proposalData = req.body;
    console.log("📥 Received from frontend:", proposalData);

    const webhookRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposalData), // Send as object, NOT array
    });

    const webhookText = await webhookRes.text();
    console.log("📤 Webhook response:", webhookText);

    if (!webhookRes.ok) {
      return res.status(500).json({
        status: "error",
        message: "Webhook rejected the data",
        webhookText,
      });
    }

    res.json({
      status: "success",
      message: "Proposal forwarded successfully",
      webhookText,
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.toString(),
    });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));

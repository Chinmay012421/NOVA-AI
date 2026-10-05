import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    assistant: "NOVA",
    aiConfigured: Boolean(client)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    if (!client) {
      return res.status(503).json({
        error: "NOVA is not connected to an AI API yet. Add OPENAI_API_KEY in Render Environment Variables."
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions:
        "You are NOVA, a helpful futuristic personal AI assistant. " +
        "Be friendly, concise, accurate, and easy to understand. " +
        "Do not claim to have performed actions you cannot actually perform. " +
        "Use plain text unless formatting genuinely improves readability.",
      input: message,
      max_output_tokens: 700
    });

    res.json({
      reply: response.output_text || "I couldn't generate a response."
    });
  } catch (error) {
    console.error("NOVA API error:", error);
    res.status(500).json({
      error: "NOVA encountered a server error. Check the Render logs."
    });
  }
});

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NOVA running on port ${PORT}`);
});
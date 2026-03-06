import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   ROOT ROUTE (HEALTH CHECK)
========================= */

app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

/* =========================
   AI ROUTE
========================= */

app.post("/ai", async (req, res) => {
  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    if (!process.env.OPENROUTER_KEY) {
      return res.status(500).json({
        error: "OPENROUTER_KEY not configured"
      });
    }

    console.log("User Prompt:", prompt);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sabkaregaai.in",
          "X-Title": "SabKaregaAI"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("OpenRouter Response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenRouter API error",
        details: data
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "AI did not return a response.";

    res.json({
      reply: reply
    });

  } catch (error) {

    console.error("Server Error:", error);

    res.status(500).json({
      error: "Internal Server Error"
    });

  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
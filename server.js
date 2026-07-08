import express from "express";
import cors from "cors";
import { fal } from "@fal-ai/client";

const app = express();
app.use(cors());
app.use(express.json());

fal.config({ credentials: process.env.FAL_KEY });

const STYLE_MODIFIERS = {
  cinematic: "cinematic lighting, moody color grade, slow camera push-in, shallow depth of field",
  meme: "bright flat lighting, fast jump cuts, bold on-screen energy, punchy colors",
  doc: "natural lighting, handheld documentary feel, realistic setting",
  asmr: "soft diffused lighting, close-up detail, calm gentle motion",
  chaos: "high contrast lighting, whip pan camera movement, glitch transitions, fast pace",
};

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    const styleText = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.cinematic;
    const enrichedPrompt = `${prompt.trim()}. Style: ${styleText}.`;

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/text-to-video", {
      input: { prompt: enrichedPrompt },
      logs: false,
    });

    const videoUrl = result?.data?.video?.url;
    if (!videoUrl) return res.status(502).json({ error: "No video returned" });

    res.json({ videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video generation failed" });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

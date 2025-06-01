const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  const apiKey = req.body.key || process.env.GEMINI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey }); // 這裡用動態 apiKey
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const answer = response.text;
    let grounding = '';
    try {
      grounding = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent || '';
    } catch {}
    return res.json({ answer, grounding });
  } catch (e) {
    console.error('[Gemini Error]', e);
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

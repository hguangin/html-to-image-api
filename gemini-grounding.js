const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/', async (req, res) => {
  let prompt = req.body.prompt;
  const apiKey = req.body.key || process.env.GEMINI_API_KEY;
  const model = req.body.model || "gemini-2.0-flash";
  const temperature = req.body.temperature;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  // 在 prompt 結尾加一組隨機字串避免被緩存
  const randomStr = Math.random().toString(36).slice(2, 10);
  prompt = `${prompt} [${randomStr}]`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const config = {
      tools: [{ googleSearch: {} }]
    };
    if (typeof temperature !== 'undefined') {
      config.temperature = temperature;
    }

    const response = await ai.models.generateContent({
      model,
      contents: [prompt],
      config
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

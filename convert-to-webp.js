const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const router = express.Router();

/**
 * POST /convert/webp
 * 請求格式：
 * {
 *   "source": {
 *     "url": "https://example.com/sample.jpg"
 *   }
 * }
 */
router.post('/webp', async (req, res) => {
  const { source } = req.body;

  if (!source || !source.url) {
    return res.status(400).send('請提供圖片連結，例如 { "source": { "url": "..." } }');
  }

  try {
    // 下載圖片 buffer
    const imageResponse = await axios.get(source.url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // 轉換並壓縮成 WebP
    const webpBuffer = await sharp(originalImageBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    res.set('Content-Type', 'image/webp');
    res.send(webpBuffer);
  } catch (err) {
    console.error('[WebP Conversion Error]');
    console.error(err);
    res.status(500).send(`圖片轉換失敗：${err.message}`);
  }
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');

const router = express.Router();

router.post('/webp', async (req, res) => {
  const { source } = req.body;

  if (!source || !source.url) {
    return res.status(400).send('請提供圖片連結，例如 { "source": { "url": "..." } }');
  }

  try {
    // 下載原始圖片為 buffer
    const imageResponse = await axios.get(source.url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // 擷取原始檔名（不含副檔名）
    const originalUrl = source.url.split('?')[0]; // 去除 query string
    const baseName = path.basename(originalUrl, path.extname(originalUrl)); // 取得檔名（不含副檔名）
    const outputFilename = `${baseName}.webp`;

    // 轉為 WebP
    const webpBuffer = await sharp(originalImageBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // 設定下載檔案名稱 header
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(webpBuffer);
  } catch (err) {
    console.error('[WebP Conversion Error]');
    console.error(err);
    res.status(500).send(`圖片轉換失敗：${err.message}`);
  }
});

module.exports = router;

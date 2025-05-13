const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
  const { source, convert = {} } = req.body;

  // 驗證網址是否提供
  if (!source || !source.url) {
    return res.status(400).send('請提供圖片連結，例如 { "source": { "url": "..." } }');
  }

  // 轉換格式與品質設定
  const format = (convert.type || 'image/webp').replace('image/', ''); // ex: webp、jpeg、png
  const quality = typeof convert.quality === 'number' ? convert.quality : 80;

  const allowedFormats = ['webp', 'jpeg', 'png'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).send(`不支援的格式 "${format}"，請使用 image/webp、image/jpeg 或 image/png`);
  }

  try {
    // Step 1：下載圖片為 buffer
    const imageResponse = await axios.get(source.url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // Step 2：從圖片網址中取得 base 檔名
    const originalUrl = source.url.split('?')[0]; // 去除 query string
    const baseName = path.basename(originalUrl, path.extname(originalUrl)) || 'output';
    const outputFilename = `${baseName}.${format}`;

    // Step 3：使用 sharp 處理格式與壓縮
    let processedImage = sharp(originalImageBuffer);
    if (format === 'webp') {
      processedImage = processedImage.webp({ quality });
    } else if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ quality });
    } else if (format === 'png') {
      processedImage = processedImage.png({ quality });
    }

    const outputBuffer = await processedImage.toBuffer();

    // Step 4：回應圖片並附檔名
    res.set('Content-Type', `image/${format}`);
    res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(outputBuffer);
  } catch (err) {
    console.error('[Image Convert Error]');
    console.error(err);
    res.status(500).send(`圖片轉換失敗：${err.message}`);
  }
});

module.exports = router;

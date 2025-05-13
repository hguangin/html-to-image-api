const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
  const { source, convert = {} } = req.body;

  if (!source || !source.url) {
    return res.status(400).send('請提供圖片連結，例如 { "source": { "url": "..." } }');
  }

  // 預設格式與品質
  const format = (convert.type || 'image/webp').replace('image/', ''); // webp, jpeg, png
  const quality = typeof convert.quality === 'number' ? convert.quality : 80;

  const allowedFormats = ['webp', 'jpeg', 'png'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).send(`不支援的格式 "${format}"，請使用 image/webp、image/jpeg 或 image/png`);
  }

  try {
    // Step 1：下載圖片
    const imageResponse = await axios.get(source.url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // Step 2：從 Content-Type 判斷副檔名（若無法從 URL 得知）
    const contentType = imageResponse.headers['content-type'];
    const mimeToExt = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };

    // 嘗試從 URL 擷取 base 名稱（無副檔名則 fallback）
    let baseName = path.basename(source.url.split('?')[0], path.extname(source.url.split('?')[0]));
    if (!baseName || baseName === '') {
      baseName = 'output';
    }

    const ext = format; // 最終轉出的格式
    const outputFilename = `${baseName}.${ext}`;

    // Step 3：圖片格式轉換與壓縮
    let processedImage = sharp(originalImageBuffer);
    if (format === 'webp') {
      processedImage = processedImage.webp({ quality });
    } else if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ quality });
    } else if (format === 'png') {
      processedImage = processedImage.png({ quality });
    }

    const outputBuffer = await processedImage.toBuffer();

    // Step 4：回傳
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(outputBuffer);
  } catch (err) {
    console.error('[Image Convert Error]');
    console.error(err);
    res.status(500).send(`圖片轉換失敗：${err.message}`);
  }
});

module.exports = router;

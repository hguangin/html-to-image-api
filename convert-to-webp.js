const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');

const router = express.Router();

router.post('/convert', async (req, res) => {
  const { source, convert = {} } = req.body;

  if (!source || !source.url) {
    return res.status(400).send('請提供圖片連結，例如 { "source": { "url": "..." } }');
  }

  // 預設格式與壓縮品質
  const format = (convert.type || 'image/webp').replace('image/', ''); // 轉成 'webp'、'jpeg'...
  const quality = typeof convert.quality === 'number' ? convert.quality : 80;

  const allowedFormats = ['webp', 'jpeg', 'png'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).send(`不支援的格式 "${format}"，請用 image/webp, image/jpeg 或 image/png`);
  }

  try {
    // 下載圖片
    const imageResponse = await axios.get(source.url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // 擷取原始檔名（不含副檔名）
    const originalUrl = source.url.split('?')[0];
    const baseName = path.basename(originalUrl, path.extname(originalUrl));
    const outputFilename = `${baseName}.${format}`;

    // 動態轉換格式
    let processedImage = sharp(originalImageBuffer);

    if (format === 'webp') {
      processedImage = processedImage.webp({ quality });
    } else if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ quality });
    } else if (format === 'png') {
      processedImage = processedImage.png({ quality }); // PNG 的 quality 實際作用較小，但 sharp 仍接受
    }

    const outputBuffer = await processedImage.toBuffer();

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

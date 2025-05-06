// index.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodeHtmlToImage = require('node-html-to-image');
const app = express();

app.use(bodyParser.json());

app.post('/html-to-image', async (req, res) => {
  const { html, content = {}, template } = req.body;

  try {
    // 指定本地字型路徑
    const fontPath = path.join(__dirname, 'fonts', 'jf-openhuninn-2.1.ttf');
    const fontFaceStyle = `
      <style>
        @font-face {
          font-family: 'Huninn';
          src: url('file://${fontPath}') format('truetype');
        }
        body, .card, h1, p {
          font-family: 'Huninn', sans-serif !important;
        }
      </style>
    `;

    let htmlTemplate = html;

    // 讀取模板檔案
    if (!htmlTemplate && template) {
      const templatePath = path.join(__dirname, 'templates', template);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).send(`Template "${template}" not found.`);
      }
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    }

    // 預設模板
    if (!htmlTemplate) {
      htmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'card-default.html'), 'utf8');
    }

    // 移除舊有的 @font-face 避免衝突
    htmlTemplate = htmlTemplate.replace(/@font-face\s*{[^}]*}/g, '');

    const finalHTML = fontFaceStyle + htmlTemplate;

    // 產生圖片
    const buffer = await nodeHtmlToImage({
      html: finalHTML,
      content,
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error('[Image Generation Error]');
    console.error(err);
    res.status(500).send(`Image generation failed.\n${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});

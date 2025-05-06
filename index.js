const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { nodeHtmlToImage } = require('node-html-to-image');
const app = express();

app.use(bodyParser.json());

// 產圖 API
app.post('/html-to-image', async (req, res) => {
  const { html, content = {}, template } = req.body;

  try {
    // 讀取字型路徑
    const fontPath = path.join(__dirname, 'fonts', 'jf-openhuninn-2.1.ttf');
    const fontFaceStyle = `
      <style>
        @font-face {
          font-family: 'Huninn';
          src: url('file://${fontPath}') format('truetype');
        }
        body { font-family: 'Huninn', sans-serif; }
      </style>
    `;

    // 讀取 HTML 模板
    let htmlTemplate = html;

    if (!htmlTemplate && template) {
      const templatePath = path.join(__dirname, 'templates', template);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).send(`Template "${template}" not found.`);
      }
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    }

    if (!htmlTemplate) {
      const defaultPath = path.join(__dirname, 'templates', 'card-default.html');
      htmlTemplate = fs.readFileSync(defaultPath, 'utf8');
    }

    // 合併字型 + HTML
    const finalHTML = fontFaceStyle + htmlTemplate;

    // 產圖
    const resultBuffer = await nodeHtmlToImage({
      html: finalHTML,
      content,
      puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });

    res.set('Content-Type', 'image/png');
    res.send(resultBuffer);
  } catch (error) {
    console.error('[圖片產生錯誤]', error);
    res.status(500).send('Image generation failed.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

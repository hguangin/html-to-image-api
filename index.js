const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodeHtmlToImage = require('node-html-to-image');

// ✅ 將原本 convert-to-webp 改為 convert-image
const convertImageRoute = require('./convert-image');

const app = express();
app.use(bodyParser.json());

// ✅ 把 API 掛在 /convert-image
app.use('/convert-image', convertImageRoute);

// ✅ 加入這行：引用 convert.js
const convertRoute = require('./convert');

app.use(bodyParser.json());

// ✅ 加入這行：設定 /convert API
app.use('/convert', convertRoute);

// ✅ 保留原本 /html-to-image 功能
app.post('/html-to-image', async (req, res) => {
  const { html, template, layers = {} } = req.body;

  try {
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

    if (!htmlTemplate && template) {
      const templatePath = path.join(__dirname, 'templates', template);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).send(`Template "${template}" not found.`);
      }
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    }

    if (!htmlTemplate) {
      htmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'card-default.html'), 'utf8');
    }

    htmlTemplate = htmlTemplate.replace(/@font-face\s*{[^}]*}/g, '');
    const finalHTML = fontFaceStyle + htmlTemplate;

    const buffer = await nodeHtmlToImage({
      html: finalHTML,
      content: layers,
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

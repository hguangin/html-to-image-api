require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodeHtmlToImage = require('node-html-to-image');

// 你的其他路由
const convertImageRoute = require('./convert-image');
const convertRoute = require('./convert');

// ✅ 新增 Gemini Grounding 路由
const geminiGroundingRoute = require('./gemini-grounding');

const app = express();
app.use(bodyParser.json());

// 既有功能
app.use('/convert-image', convertImageRoute);
app.use('/convert', convertRoute);

// ✅ 新增 Gemini API 查證
app.use('/gemini-grounding', geminiGroundingRoute);

// 既有 HTML to image API
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

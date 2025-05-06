// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { nodeHtmlToImage } = require('node-html-to-image');
const app = express();

const OUTPUT_DIR = './output';
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);

app.use(bodyParser.json());

app.post('/html-to-image', async (req, res) => {
  const { html, content = {}, template } = req.body;

  try {
    let htmlTemplate = html;

    // 讀取模板檔案
    if (!htmlTemplate && template) {
      const fs = require('fs');
      const templatePath = join(__dirname, 'templates', template);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).send(`Template "${template}" not found.`);
      }
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    }

    // 預設模板
    if (!htmlTemplate) {
      const fs = require('fs');
      htmlTemplate = fs.readFileSync(join(__dirname, 'templates', 'card-default.html'), 'utf8');
    }

    // 替換變數內容
    const resultBuffer = await nodeHtmlToImage({
      html: htmlTemplate,
      content,
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    res.set('Content-Type', 'image/png');
    res.send(resultBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Image generation failed.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

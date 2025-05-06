const express = require('express');
const nodeHtmlToImage = require('node-html-to-image');
const app = express();

app.use(express.json());

app.post('/html-to-image', async (req, res) => {
  const { html, content, options } = req.body;

  try {
    const buffer = await nodeHtmlToImage({
      html,
      content,
      type: 'png',
      encoding: 'buffer',
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      ...options
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ HTML to Image server is running!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});

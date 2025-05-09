// convert.js
const express = require('express');
const OpenCC = require('opencc-js');

const router = express.Router();
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

router.post('/', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: '請提供 text 欄位' });
  }

  const converted = converter(text);
  res.json({ converted });
});

module.exports = router;

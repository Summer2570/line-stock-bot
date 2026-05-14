import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { findProductStock, buildStockReply } from './inventory.js';
import { replyMessage, textMessage } from './line.js';
import { config } from './config.js';
import axios from 'axios';

const app = express();
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

// ตรวจ LINE signature
function verifySignature(req) {
  const sig = req.headers['x-line-signature'];
  const hash = crypto
    .createHmac('SHA256', config.line.channelSecret)
    .update(req.rawBody)
    .digest('base64');
  return hash === sig;
}

// ถาม Gemini
async function askGemini(text) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text }] }] }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่มีคำตอบ';
}

// ตรวจว่าเป็นรหัสสินค้าไหม เช่น T-118, A001
function looksLikePartCode(text) {
  return /^[A-Za-z][-\s]?\d+$/.test(text.trim());
}

app.post('/webhook', async (req, res) => {
  if (!verifySignature(req)) return res.sendStatus(401);

  res.sendStatus(200); // ตอบ LINE ก่อนเสมอ

  const events = req.body.events || [];

  for (const event of events) {
    if (event.type !== 'message' || !event.message?.text) continue;

    const userText = event.message.text.trim();
    console.log('User text:', userText);

    let replyText;

    if (looksLikePartCode(userText)) {
      // ค้นหาใน Google Sheets
      console.log('Stock question detected');
      const result = await findProductStock(userText);
      console.log('Stock result:', result);
      replyText = buildStockReply(result);
    } else {
      // ถาม Gemini
      replyText = await askGemini(userText);
    }

    await replyMessage(event.replyToken, [textMessage(replyText)]);
  }
});

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
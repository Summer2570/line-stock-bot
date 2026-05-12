import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';

import {
  verifyLineSignature,
  replyMessage,
  textMessage
} from './line.js';

import {
  isStockQuestion,
  findProductStock,
  buildStockReply
} from './inventory.js';

const app = express();

// ngrok proxy support
app.set('trust proxy', 1);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// IMPORTANT:
// LINE webhook requires RAW BODY
app.use(
  '/webhook',
  express.raw({
    type: 'application/json'
  })
);

// normal JSON routes
app.use((req, res, next) => {

  if (req.originalUrl === '/webhook') {
    return next();
  }

  express.json()(req, res, next);

});

app.get('/', (_req, res) => {

  res.json({
    ok: true,
    service: 'line-stock-bot'
  });

});

app.get('/health', (_req, res) => {

  res.json({
    ok: true,
    time: new Date().toISOString()
  });

});

app.post('/webhook', async (req, res) => {

  try {

    console.log(
      'Webhook received'
    );

    const signature =
      req.headers['x-line-signature'];

    const rawBody = req.body;

    console.log(
      'Signature:',
      signature
    );

    // verify signature
    const validSignature =
      verifyLineSignature(
        rawBody,
        signature
      );

    console.log(
      'Signature valid:',
      validSignature
    );

    if (!validSignature) {

      console.warn(
        'Invalid LINE signature'
      );

      return res.status(401).json({
        error: 'Invalid signature'
      });
    }

    let body;

    try {

      body = JSON.parse(
        rawBody.toString('utf8')
      );

      console.log(
        'Parsed body:',
        JSON.stringify(body, null, 2)
      );

    } catch (err) {

      console.error(
        'JSON parse error:',
        err
      );

      return res.status(400).json({
        error: 'Invalid JSON'
      });
    }

    const events =
      Array.isArray(body.events)
        ? body.events
        : [];

    console.log(
      'Events count:',
      events.length
    );

    await Promise.all(
      events.map(handleEvent)
    );

    return res.sendStatus(200);

  } catch (err) {

    console.error(
      'Webhook processing error:',
      err
    );

    return res.sendStatus(500);
  }
});

async function handleEvent(event) {

  console.log(
    'Incoming event:',
    JSON.stringify(event, null, 2)
  );

  if (!event) {
    console.log('Skip: no event');
    return;
  }

  if (event.type !== 'message') {
    console.log('Skip: not message');
    return;
  }

  if (!event.message) {
    console.log('Skip: no message');
    return;
  }

  if (event.message.type !== 'text') {
    console.log('Skip: not text');
    return;
  }

  const userText =
    event.message.text || '';

  console.log(
    'User text:',
    userText
  );

  let replyText = '';

  try {

    if (
      isStockQuestion(userText)
    ) {

      console.log(
        'Stock question detected'
      );

      const result =
        await findProductStock(userText);

      console.log(
        'Stock result:',
        result
      );

      replyText =
        buildStockReply(result);

    } else {

      console.log(
        'Fallback message'
      );

      replyText = [
        'สวัสดีครับ 👋',
        'ผมช่วยเช็กสต็อกสินค้าได้',
        '',
        'ลองพิมพ์:',
        '• iPhone 15 เหลือเท่าไร',
        '• AirPods มีของไหม'
      ].join('\n');
    }

  } catch (err) {

    console.error(
      'Build reply error:',
      err
    );

    replyText =
      'ขออภัยครับ ระบบขัดข้องชั่วคราว';
  }

  console.log(
    'Reply text:',
    replyText
  );

  try {

    console.log(
      'Sending LINE reply...'
    );

    const response =
      await replyMessage(
        event.replyToken,
        [
          textMessage(replyText)
        ]
      );

    console.log(
      'Reply success:',
      response
    );

  } catch (err) {

    console.error(
      'LINE reply error:',
      err.response?.data || err.message
    );
  }
}

app.use((
  err,
  _req,
  res,
  _next
) => {

  console.error(
    'Unhandled error:',
    err
  );

  res.status(500).json({
    error: 'Internal server error'
  });
});

app.listen(config.port, () => {

  console.log(
    `LINE stock bot running on port ${config.port}`
  );

  console.log(
    `Inventory source: ${config.inventorySource}`
  );
});
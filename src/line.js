import crypto from 'crypto';
import axios from 'axios';
import { config } from './config.js';

export function verifyLineSignature(
  body,
  signature
) {

  const hash = crypto
    .createHmac(
      'SHA256',
      config.line.channelSecret
    )
    .update(body)
    .digest('base64');

  return hash === signature;
}

export async function replyMessage(
  replyToken,
  messages
) {

  try {

    console.log(
      'Sending LINE reply...'
    );

    const response = await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken,
        messages
      },
      {
        headers: {
          Authorization:
            `Bearer ${config.line.channelAccessToken}`,
          'Content-Type':
            'application/json'
        }
      }
    );

    console.log(
      'Reply success:',
      response.status
    );

    return response.data;

  } catch (err) {

    console.error(
      'LINE reply API error:',
      err.response?.data || err.message
    );

    throw err;
  }
}

export function textMessage(text) {

  return {
    type: 'text',
    text
  };
}
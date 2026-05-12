import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  inventorySource:
    process.env.INVENTORY_SOURCE || 'mock',

  line: {
    channelAccessToken:
      process.env.CHANNEL_ACCESS_TOKEN,

    channelSecret:
      process.env.CHANNEL_SECRET
  }
};
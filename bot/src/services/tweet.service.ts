import { Injectable } from '@nestjs/common';

import { TweetRequest } from '../interfaces/tweet.interface';

import twit from 'twit';

import dotenv from 'dotenv';
dotenv.config();

const twitterConfig = process.env.NODE_ENV === 'prod' ? {
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token: process.env.TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET,
} : {
  consumer_key: process.env.DEV_TW_CONSUMER_KEY,
  consumer_secret: process.env.DEV_TW_CONSUMER_SECRET,
  access_token: process.env.DEV_TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.DEV_TW_ACCESS_TOKEN_SECRET,
};

const twitterClient = new twit(twitterConfig);

@Injectable()
export class TweetService {

  // constructor() {}

  async tweet(data: TweetRequest) {

    let media_ids: Array<string>;
    if (data?.image) {
      // Upload the item's image to Twitter & retrieve a reference to it
      media_ids = await new Promise((resolve) => {
        twitterClient.post('media/upload', { media_data: data?.image }, (error: any, media: any) => {
          resolve(error ? null : [media.media_id_string]);
        });
      });
    }

    const tweet: any = { status: data.text };
    if (media_ids) tweet.media_ids = media_ids;

    // Post the tweet
    twitterClient.post('statuses/update', tweet, (error) => {
      if (!error) console.log(`Successfully tweeted: ${data.text}`);
      else console.error(error);
    });

    console.log(data.text);
  }

}
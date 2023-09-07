import { Injectable } from '@nestjs/common';

import { Message } from 'src/interfaces/message.interface';

import { PushSubscription, sendNotification, setGCMAPIKey, setVapidDetails } from 'web-push';

import dotenv from 'dotenv';
dotenv.config();

// import * as admin from 'firebase-admin';
// import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });

setGCMAPIKey(process.env.FIREBASE_SERVER_KEY);
setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

@Injectable()
export class PushService {

  constructor() { }

  async sendPushNotification(message: Message, subscriptions: PushSubscription[]): Promise<any> {

    const { title, pushText, image, tokenId } = message;

    const payload = {
      title,
      body: pushText,
      imageUrl: `https://goerli.phunks.auction/assets/icons/icon.png`,
    };

    for (const subscription of subscriptions) {
      const send = await sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      console.log({ send });
    }
  }

  // async sendPushNotification(message: Message, tokens: string[]): Promise<BatchResponse> {
  //   const { title, pushText, image, tokenId } = message;
  //   const payload = {
  //     tokens,
  //     notification: {
  //       title,
  //       body: pushText,
  //       imageUrl: `https://goerli.phunks.auction/assets/icons/icon.png`,
  //       // click_action: url,
  //     }
  //   };
  //   return await admin.messaging().sendEachForMulticast(payload);
  // }
}
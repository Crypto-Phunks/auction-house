import { Injectable } from '@nestjs/common';

import { Message } from 'src/interfaces/message.interface';

import * as admin from 'firebase-admin';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

import dotenv from 'dotenv';
dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });

@Injectable()
export class PushService {

  constructor() { }

  async sendPushNotification(message: Message, tokens: string[]): Promise<BatchResponse> {

    const { title, pushText, image, tokenId } = message;

    const payload = {
      tokens,
      notification: {
        title,
        body: pushText,
        imageUrl: `https://goerli.phunks.auction/assets/icons/icon.png`,
        // click_action: url,
      }
    };

    return await admin.messaging().sendEachForMulticast(payload);
  }
}
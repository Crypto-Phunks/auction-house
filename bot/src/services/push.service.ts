import { Injectable } from '@nestjs/common';

import { Message } from 'src/interfaces/message.interface';

import * as admin from 'firebase-admin';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

import serviceAccount from '../service-account.json';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PushService {

  constructor() { }

  async sendPushNotification(message: Message, tokens: string[]): Promise<BatchResponse> {

    const { title, text, image, tokenId } = message;

    const payload = {
      tokens,
      notification: {
        title,
        body: text,
        imageUrl: `https://goerli.phunks.auction/assets/icons/icon.png`,
        // click_action: url,
      }
    };

    return await admin.messaging().sendEachForMulticast(payload);
  }
}
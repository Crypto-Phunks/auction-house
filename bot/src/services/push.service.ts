import { Injectable } from '@nestjs/common';

import { Message } from 'src/interfaces/message.interface';

import { PushSubscription, RequestOptions, SendResult, sendNotification, setVapidDetails } from 'web-push';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const apnsKeyBase64 = process.env.APNS_AUTH_KEY;
const apnsKeyContent = Buffer.from(apnsKeyBase64, 'base64').toString('utf8');

// setGCMAPIKey(process.env.FIREBASE_SERVER_KEY);
setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

@Injectable()
export class PushService {

  async sendPushNotification(message: Message, subscriptions: PushSubscription[]): Promise<any> {

    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APNS_KEY_ID;
    const privateKey = apnsKeyContent;

    // Create the token
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({
      iss: teamId,
      iat: now,
      exp: now + (60 * 60),
      aud: 'https://web.push.apple.com',
      sub: process.env.WEB_PUSH_CONTACT
    }, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId
      }
    });

    const { title, pushText, image, tokenId } = message;

    const notifPayload = {
      notification: {
        title,
        body: pushText,
        imageUrl: `https://goerli.phunks.auction/assets/icons/icon.png`,
      },
    };

    const requestOptions: RequestOptions = {
      vapidDetails: {
        subject: process.env.WEB_PUSH_CONTACT,
        publicKey: process.env.PUBLIC_VAPID_KEY,
        privateKey: process.env.PRIVATE_VAPID_KEY,
      }
    };

    const res = { success: [], failed: [] };
    for (const subscription of subscriptions) {
      
      try {
        let notification!: Promise<SendResult>;

        if (subscription.endpoint.startsWith('https://web.push.apple.com')) {
          // Set the authorization header with JWT for APNs
          requestOptions.headers = {
            'TTL': '3600',
            'Authorization': `Bearer ${token}`,
          };

          notification = sendNotification(subscription, JSON.stringify(notifPayload), requestOptions);
        } else {
          notification = sendNotification(subscription, JSON.stringify(notifPayload), requestOptions);
        }

        res.success.push({ subscription, notification });
      } catch (error) {
        console.log(error);
        res.failed.push({ subscription, error });
      }
    }

    res.success = await Promise.all(res.success.map(async (item) => {
      return {
        subscription: item.subscription,
        notification: await item.notification
      }
    }));

    return res;
  }
}
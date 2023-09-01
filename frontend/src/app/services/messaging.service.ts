import { Injectable } from '@angular/core';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { app } from 'src/firebase.config';

const messaging = getMessaging(app);
getToken(messaging, {
  vapidKey: 'BGMg426N6tLVS6OsWuCxfewDOomVAcPLhi2KkUNGAZiiPQB8XlBZHad9lKsFfrhm5zyKx2sTBWiT5Uxs08Sd0pQ',
});

@Injectable({
  providedIn: 'root',
})
export class MessagingService {

  private hasPermission = new BehaviorSubject<boolean>(false);
  hasPermission$ = this.hasPermission.asObservable();

  constructor() {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', { payload });
      // ...
    });
  }

  async requestPermission(): Promise<void> {
    try {
      await Notification.requestPermission();
      this.hasPermission.next(true);
    } catch (error) {
      console.error(error);
      this.hasPermission.next(false);
    }
  }
}

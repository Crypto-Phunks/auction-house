import { Injectable } from '@angular/core';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { app } from 'src/firebase.config';

const messaging = getMessaging(app);

@Injectable({
  providedIn: 'root',
})
export class MessagingService {

  private hasPermission = new BehaviorSubject<boolean>(false);
  hasPermission$ = this.hasPermission.asObservable();

  isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  constructor() {
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', { payload });
    //   // ...
    // });

    this.setPermission();
  }

  setPermission(): void {
    if (!this.isSupported) {
      this.hasPermission.next(false);
      return;
    }

    const permission = Notification.permission;
    this.hasPermission.next(permission === 'granted');
  }

  async requestPermission(): Promise<void> {

    if (!this.isSupported) {
      this.hasPermission.next(false);
      return;
    }

    // Check permissions if they exist
    const permission = Notification.permission;
    if (permission === 'granted') {
      this.hasPermission.next(true);
      return;
    } else if (permission === 'denied') {
      this.hasPermission.next(false);
      return;
    }

    // If they dont exist (default) request them
    try {
      const token = await getToken(messaging, { vapidKey: environment.notifications.vapidKey });
      console.log('token', token);
      if (token) this.hasPermission.next(true);
    } catch (error) {
      console.error(error);
      this.hasPermission.next(false);
    }
  }
}

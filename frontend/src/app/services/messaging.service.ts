import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { app } from 'src/firebase.config';

const messaging = getMessaging(app);

@Injectable({
  providedIn: 'root',
})
export class MessagingService {

  private hasPermission = new BehaviorSubject<boolean>(false);
  hasPermission$ = this.hasPermission.asObservable();

  loadingPermission = false;

  isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  constructor(
    private http: HttpClient
  ) {
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', { payload });
    //   // ...
    // });
    this.setInitialPermission();
  }

  setInitialPermission(): void {
    if (!this.isSupported) {
      this.setPermission(false);
      return;
    }

    const permission = Notification.permission;
    this.setPermission(permission === 'granted');
  }

  async requestPermission(): Promise<void> {

    if (!this.isSupported) {
      this.setPermission(false);
      return;
    }

    this.loadingPermission = true;

    // Check permissions if they exist
    const permission = Notification.permission;
    if (permission === 'granted') {
      this.setPermission(true);
      return;
    } else if (permission === 'denied') {
      this.setPermission(false);
      return;
    }

    // If they dont exist (default) request them
    try {
      const token = await getToken(messaging, { vapidKey: environment.notifications.vapidKey });
      await firstValueFrom(this.http.post(`${environment.notifications.apiUrl}/subscribe`, { token }));
      if (token) this.setPermission(true);
    } catch (error) {
      console.error(error);
      this.setPermission(false);
    }
  }

  setPermission(value: boolean): void {
    this.hasPermission.next(value);
    this.loadingPermission = false;
  }
}

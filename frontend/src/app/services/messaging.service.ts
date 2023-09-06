import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { app } from 'src/firebase.config';
import { SwUpdate } from '@angular/service-worker';

const messaging = getMessaging(app);

@Injectable({
  providedIn: 'root',
})
export class MessagingService {

  registration?: ServiceWorkerRegistration;

  private hasPermission = new BehaviorSubject<boolean>(false);
  hasPermission$ = this.hasPermission.asObservable();

  loadingPermission = false;

  isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  constructor(
    private http: HttpClient,
    private swUpdate: SwUpdate,
  ) {

    this.setInitialPermission();
    if (this.swUpdate.isEnabled) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log({ registration })
        this.swUpdate.checkForUpdate();
      });
    }
  }

  async getToken(): Promise<string> {
    return await getToken(messaging, {
      vapidKey: environment.notifications.vapidKey,
    });
  }

  setInitialPermission(): void {
    if (!this.isSupported) return this.setPermission(false);
    const permission = Notification.permission;
    this.setPermission(permission === 'granted');
  }

  async requestPermission(): Promise<void> {
    if (!this.isSupported) return this.setPermission(false);

    this.loadingPermission = true;

    // Check permissions if they exist
    const permission = Notification.permission;
    if (permission === 'granted') return this.setPermission(true);
    else if (permission === 'denied') return this.setPermission(false);

    // If they dont exist (default) request them
    try {
      const token = await this.getToken();
      if (!token) return this.setPermission(false);

      this.setPermission(true);
      await firstValueFrom(this.http.post(`${environment.notifications.apiUrl}/subscribe`, { token }));
    } catch (error) {
      console.error(error);
      this.setPermission(false);
    }
  }

  saveToken(token: string): void {
    localStorage.setItem('push_token', token);
  }

  getSavedToken(): string | null {
    return localStorage.getItem('push_token');
  }

  setPermission(value: boolean): void {
    this.hasPermission.next(value);
    this.loadingPermission = false;
  }
}

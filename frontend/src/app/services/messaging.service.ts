import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';

import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';

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
    this.init().then(() => {
      console.log('Messaging service initialized');
    }).catch(error => {
      console.error(error);
    });
  }

  async init(): Promise<void> {
    this.registration = await navigator.serviceWorker.ready;
    console.log({ registration: this.registration });
    await this.setInitialPermission();
    await this.swUpdate.checkForUpdate();
  }

  async setInitialPermission(): Promise<void> {
    if (!this.isSupported) return this.setPermission(false);

    const permission = Notification.permission;

    if (permission === 'granted') {
      this.setPermission(true);
      const subscription = await this.getSubscription();
      if (subscription) await this.sendSubscriptionToServer(subscription);
    } else if (permission === 'denied') {
      this.setPermission(false);
    } else {
      // Permission is 'default'
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (this.registration) {
      return await this.registration.pushManager.getSubscription() ||
      await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.notifications.vapidKey),
      });
    }
    return null;
  }

  async sendSubscriptionToServer(subscription: PushSubscription | null): Promise<any> {
    if (!subscription) return;

    const userId = this.getOrCreateUserId();
    return await firstValueFrom(
      this.http.post(`${environment.notifications.apiUrl}/subscribe`, { subscription, userId })
    );
  }

  async requestPermission(): Promise<void> {
    this.loadingPermission = true;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setPermission(true);
        const newSubscription = await this.getSubscription();
        await this.sendSubscriptionToServer(newSubscription);
      } else {
        this.setPermission(false);
      }
    } catch (error) {
      console.error(error);
      this.setPermission(false);
    } finally {
      this.loadingPermission = false;
    }
  }

  setPermission(value: boolean): void {
    this.hasPermission.next(value);
    this.loadingPermission = false;
  }

  getOrCreateUserId(): string {
    let userId = localStorage.getItem('app_user');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_user', userId);
    }
    return userId;
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '@/components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { GlobalState, Theme } from './interfaces/global-state';
import { Store } from '@ngrx/store';

import * as actions from './state/actions/app-state.action';
import * as selectors from './state/selectors/app-state.selector';

import { environment } from 'src/environments/environment';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    HeaderComponent,
    FooterComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  env = environment;
  expanded: boolean = false;

  loaded$ = this.store.select(selectors.selectLoaded);

  showInstallPrompt = false;
  promptType = 'bottom';
  installMessage = '';
  installInstructions = '';

  constructor(
    private store: Store<GlobalState>,
  ) {
    // Get theme from OS

    this.setTheme();

    // query.addEventListener('change', (event) => fn(event.matches));

    this.store.dispatch(actions.fetchAuctions());
    this.store.dispatch(actions.fetchTreasuryValues());
  }

  ngOnInit() {
    // Check if user already dismissed the prompt
    if (!!localStorage.getItem('installPromptDismissed')) return;

    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.showInstallPrompt = false;
      return;
    }

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      this.showInstallPrompt = true;

      this.installMessage = 'Never miss an auction again. Add the Auction House to your homescreen for real-time push notifications.';
      this.installInstructions = 'To install this app on your device: Tap Share button, then "Add to Home Screen"';
    } else {
      window.addEventListener('beforeinstallprompt', (event) => {
        // Prevent the mini-infobar from appearing on mobile
        event.preventDefault();
        // Store the event to trigger later
        this.showInstallPrompt = true;
        this.setInstallMessageForOthers();
      });
    }
  }

  setInstallMessageForOthers() {
    // Check if it's a desktop
    const isDesktop = !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    if (isDesktop) {
      this.promptType = 'small';
      this.installMessage = 'Never miss an auction again. Turn on push notifications for real-time auction updates.';
      this.installInstructions = 'To install this app, use your browser\'s settings and "Add to Home Screen" or "Install"';
    } else {
      this.promptType = 'large';
      this.installMessage = 'Never miss an auction again. Turn on push notifications for real-time auction updates.';
      this.installInstructions = 'To install this app, tap on the browser\'s menu and "Add to Home Screen"';
    }
  }

  dismissPrompt() {
    this.showInstallPrompt = false;
    localStorage.setItem('installPromptDismissed', 'true');
  }

  setTheme(): void {
    const savedTheme = localStorage.getItem('mode') as Theme;

    if (window.matchMedia) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (isDarkMode ? 'dark' : 'light');
      this.store.dispatch(actions.setTheme({ theme }));
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const newTheme = e.matches ? 'dark' : 'light';
      this.store.dispatch(actions.setTheme({ theme: newTheme }));
    });
  }
}

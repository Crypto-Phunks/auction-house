import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '@/components/header/header.component';

import { GlobalState, Theme } from './interfaces/global-state';
import { Store } from '@ngrx/store';

import * as actions from './state/actions/app-state.action';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    HeaderComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(
    private store: Store<GlobalState>,
  ) {
    const theme = localStorage.getItem('mode') as Theme || 'dark';
    this.store.dispatch(actions.setTheme({ theme }));

    this.store.dispatch(actions.fetchAuctions());
    this.store.dispatch(actions.fetchTreasuryValues());
  }

}

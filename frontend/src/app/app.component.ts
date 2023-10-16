import { Component } from '@angular/core';
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

export class AppComponent {

  env = environment;
  expanded: boolean = false;

  loaded$ = this.store.select(selectors.selectLoaded);

  constructor(
    private store: Store<GlobalState>,
  ) {
    const theme = localStorage.getItem('mode') as Theme || 'dark';
    this.store.dispatch(actions.setTheme({ theme }));

    this.store.dispatch(actions.fetchAuctions());
    this.store.dispatch(actions.fetchTreasuryValues());
  }
}

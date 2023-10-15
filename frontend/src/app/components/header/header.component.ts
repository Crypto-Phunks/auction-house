import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Store } from '@ngrx/store';

import { MessagingService } from '@/services/messaging.service';
import { Web3Service } from '@/services/web3.service';

import { TreasuryInfoComponent } from '@/components/treasury-info/treasury-info.component';

import { TippyDirective } from '@/directives/tippy.directive';

import { GlobalState } from '@/interfaces/global-state';

import { Subject, tap, withLatestFrom } from 'rxjs';

import * as selectors from '@/state/selectors/app-state.selector';
import * as actions from '@/state/actions/app-state.action';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    TreasuryInfoComponent,

    TippyDirective
  ],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  web3Connected$ = this.store.select(selectors.selectConnected);
  theme$ = this.store.select(selectors.selectTheme);

  connectClick$ = new Subject<void>();
  setModeClick$ = new Subject<void>();

  constructor(
    private store: Store<GlobalState>,
    private web3Svc: Web3Service,
    public msgSvc: MessagingService
  ) {
    this.connectClick$.pipe(
      withLatestFrom(this.web3Connected$),
      tap(([_, connected]) => connected ? this.web3Svc.disconnectWeb3() : this.web3Svc.connect())
    ).subscribe();

    this.setModeClick$.pipe(
      withLatestFrom(this.theme$),
      tap(([_, theme]) => this.store.dispatch(actions.setTheme({ theme: theme === 'dark' ? 'light' : 'dark' })))
    ).subscribe();
  }

}

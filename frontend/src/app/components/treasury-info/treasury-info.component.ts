import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { FormatCashPipe } from '@/pipes/format-cash.pipe';

import { GlobalState } from '@/interfaces/global-state';

import * as selectors from '@/state/selectors/app-state.selector';

@Component({
  selector: 'app-treasury-info',
  standalone: true,
  imports: [
    CommonModule,

    FormatCashPipe
  ],
  templateUrl: './treasury-info.component.html',
  styleUrls: ['./treasury-info.component.scss']
})
export class TreasuryInfoComponent {

  treasuryValues$ = this.store.select(selectors.selectTreasuryValues);

  constructor(
    private store: Store<GlobalState>,
  ) {}

}

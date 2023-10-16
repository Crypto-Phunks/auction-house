import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import { Store } from '@ngrx/store';

import { DataService } from '@/services/data.service';

import { Auction } from '@/interfaces/auction';
import { GlobalState } from '@/interfaces/global-state';

import { BidComponent } from '@/components/bid/bid.component';
import { PhunkInfoComponent } from '@/components/phunk-info/phunk-info.component';
import { AuctionSliderComponent } from '@/components/auction-slider/auction-slider.component';

import { PhunkImageDirective } from '@/directives/phunk-image.directive';

import { Subscription } from 'rxjs';

import tinyColor from 'tinycolor2';

import { environment } from 'src/environments/environment';

import * as selectors from '@/state/selectors/app-state.selector';
import * as actions from '@/state/actions/app-state.action';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    HammerModule,

    BidComponent,
    PhunkInfoComponent,
    AuctionSliderComponent,

    PhunkImageDirective
  ],
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.scss']
})

export class AuctionComponent {

  env = environment;

  currentAuction!: Auction;
  subscription!: Subscription;

  // Visuals
  color: string = '0, 0, 0';

  auctions$ = this.store.select(selectors.selectAuctions);
  activeAuction$ = this.store.select(selectors.selectActiveAuction);
  color$ = this.store.select(selectors.selectActiveColor);

  constructor(
    private store: Store<GlobalState>,
    public dataSvc: DataService
  ) {}

  async setBackgroundColor($event: tinyColor.ColorFormats.RGBA) {
    this.color = `${$event.r}, ${$event.g}, ${$event.b}`;
  }

  swipe($event: any) {
    if ($event.direction === 2) this.store.dispatch(actions.navigateAuctions({ direction: 'next' }));
    if ($event.direction === 4) this.store.dispatch(actions.navigateAuctions({ direction: 'prev' }));
  }
}

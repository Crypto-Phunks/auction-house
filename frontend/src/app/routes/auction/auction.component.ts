import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataService } from '@/services/data.service';
import { Auction } from '@/interfaces/auction';

import { BidComponent } from '@/components/bid/bid.component';
import { PhunkInfoComponent } from '@/components/phunk-info/phunk-info.component';
import { AuctionSliderComponent } from '@/components/auction-slider/auction-slider.component';

import { PhunkImageDirective } from '@/directives/phunk-image.directive';

import { environment } from 'src/environments/environment';

import { combineLatest, map, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';

import tinyColor from 'tinycolor2';

import { GlobalState } from '@/interfaces/global-state';
import * as selectors from '@/state/selectors/app-state.selector';

@Component({
  standalone: true,
  imports: [
    CommonModule,

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
  expanded: boolean = false;

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

}

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

import tinyColor from 'tinycolor2';

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

export class AuctionComponent implements OnInit, AfterViewInit, OnDestroy {

  env = environment;

  currentAuction!: Auction;
  subscription!: Subscription;

  // Visuals
  backgroundColor: string = '0, 0, 0';
  expanded: boolean = false;

  constructor(
    public dataSvc: DataService
  ) {}

  ngOnInit(): void {
    console.log('AuctionComponent', 'ngOnInit');

    this.subscription = combineLatest([
      this.dataSvc.auctionData$,
      this.dataSvc.activeIndex$
    ]).pipe(
      map(([ data, index ]) => data[index])
    ).subscribe((res) => {
      this.currentAuction = res;
    });
  }

  ngAfterViewInit(): void {
    console.log('AuctionComponent', 'ngAfterViewInit');
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    console.log('AuctionComponent', 'ngOnDestroy');
  }

  async setBackgroundColor($event: tinyColor.ColorFormats.RGBA) {
    this.backgroundColor = `${$event.r}, ${$event.g}, ${$event.b}`;
  }

}

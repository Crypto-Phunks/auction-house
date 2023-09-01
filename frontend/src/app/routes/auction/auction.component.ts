import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { DataService } from 'src/app/services/data.service';

import { Auction } from 'src/app/interfaces/auction';

import { environment } from 'src/environments/environment';

import tinyColor from 'tinycolor2';

import { combineLatest, map, Subscription } from 'rxjs';

@Component({
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

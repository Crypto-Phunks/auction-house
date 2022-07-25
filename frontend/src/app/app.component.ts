import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { DataService } from './services/data.service';

import { filter, map, switchMap, tap } from 'rxjs';

import { Auction } from './interfaces/auction';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(
    private readonly dataSvc: DataService,
    private router: Router
  ) {

    let activeRoute: string; // This is the phunkId

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      switchMap((res: any) => {
        const urlArray = (res?.url)?.split('/')?.filter((res: string) => res);
        activeRoute = urlArray[0] === 'auction' && urlArray[1] ? urlArray[1] : null;
        return dataSvc.auctionData$;
      }),
      tap((data: Auction[]) => {
        const activeAuction: Auction = data.filter((auction: Auction) => auction.id === activeRoute)[0];
        const activeIndex: number = activeRoute ? data.indexOf(activeAuction) : 0;
        if (activeIndex > -1) this.dataSvc.setActiveIndex(activeIndex);
      })
    ).subscribe();
  }
  
}

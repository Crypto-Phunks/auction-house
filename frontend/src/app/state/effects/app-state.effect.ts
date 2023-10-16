import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { ROUTER_NAVIGATION, RouterNavigatedAction } from '@ngrx/router-store';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { GlobalState } from '@/interfaces/global-state';

import * as actions from '@/state/actions/app-state.action';
import * as selectors from '@/state/selectors/app-state.selector';

import { catchError, from, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ThemeService } from '@/services/theme.service';
import { Web3Service } from '@/services/web3.service';
import { DataService } from '@/services/data.service';
import { Auction } from '@/interfaces/auction';
import { Router } from '@angular/router';

@Injectable()
export class AppStateEffects {

  setAuctionRoute$ = createEffect(() => this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    map((action: RouterNavigatedAction) => action.payload.routerState.url),
    switchMap((url: string) => {

      const urlArray = url.split('/').filter((res: string) => res);

      const currentAuction$ = from(this.web3Svc.getCurrentAuction()).pipe(
        map((auction) => this.web3Svc.typedAuction(auction))
      );

      if (!urlArray.length) return this.store.select(selectors.selectAuctions).pipe(
        map((auctions) => (auctions || [])[0]),
        switchMap((auction) => auction ? of(auction) : currentAuction$),
        catchError(() => currentAuction$)
      );

      const auctionId = urlArray[1];
      return this.store.select(selectors.selectAuctions).pipe(
        map((auctions) => auctions?.find((auction) => auction.id === auctionId)),
        switchMap((auction) => auction ? of(auction) : currentAuction$),
        catchError(() => currentAuction$)
      );
    }),
    map((data: Auction) => actions.setActiveAuction({ activeAuction: data }))
  ));

  fetchAuctionData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.fetchAuctions),
    switchMap(() => this.dataSvc.watchAuctionData(500, 0)),
    map((auctions) => actions.setAuctions({ auctions })),
    tap(() => this.store.dispatch(actions.setLoaded({ loaded: true }))),
  ));

  addressChanged$ = createEffect(() => this.actions$.pipe(
    ofType(actions.setWalletAddress),
  ), { dispatch: false });

  setTheme$ = createEffect(() => this.actions$.pipe(
    ofType(actions.setTheme),
    tap(({ theme }) => this.themeSvc.setTheme(theme))
  ), { dispatch: false });

  fetchTreasuryValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.fetchTreasuryValues),
    switchMap(() => from(this.web3Svc.fetchTreasuryValues())),
    map((treasuryValues) => actions.setTreasuryValues({ treasuryValues }))
  ));

  contractEvent$ = createEffect(() => this.actions$.pipe(
    ofType(actions.contractEvent),
    withLatestFrom(this.store.select(selectors.selectActiveAuction)),
    map(([action, activeAuction]) => {

      activeAuction = { ...activeAuction } as Auction;
      const logs = action.logs;

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i] as any;

        if (log.eventName === 'AuctionCreated') {}
        if (log.eventName === 'AuctionBid') {
          // const { auctionId, extended, phunkId, sender, value } = log.args;
          // if (activeAuction.id !== auctionId.toString()) continue;
          // activeAuction.amount = value.toString();

          // const bid: Bid = {
          //   id: auctionId.toString(),
          //   bidder: { id: sender },
          //   amount: value.toString(),
          //   blockTimestamp: Math.floor(Date.now() / 1000).toString(),
          // }

          // activeAuction.bids = [bid, ...activeAuction.bids];
        }

        if (log.eventName === 'AuctionExtended') {
          // const { auctionId, endTime, phunkId } = log.args;
          // if (activeAuction.id !== auctionId.toString()) continue;
          // activeAuction.endTime = Number(endTime) * 1000;
        }

        console.log('log', log);
      }

      return activeAuction;
    }),
    // map((activeAuction) => actions.setActiveAuction({ activeAuction }))
  ), { dispatch: false });

  setActiveColors$ = createEffect(() => this.actions$.pipe(
    ofType(actions.setActiveColor),
    tap(({ color }) => document.documentElement.style.setProperty('--active-color', color))
  ), { dispatch: false });

  navigateAuctions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.navigateAuctions),
    withLatestFrom(
      this.store.select(selectors.selectAuctions),
      this.store.select(selectors.selectActiveAuction),
    ),
    tap(([action, auctions, activeAuction]) => console.log('action', action.direction)),
    tap(([action, auctions, activeAuctions]) => {
      if (!auctions?.length) return;

      const activeIndex = auctions.findIndex((a) => a.id === activeAuctions?.id);
      const nav = action.direction;

      if (nav === 'prev' && activeIndex + 1 < auctions?.length) {
        this.router.navigate(['/auction', auctions[activeIndex + 1]?.id]);
      } else if (nav === 'next' && activeIndex > 1) {
        this.router.navigate(['/auction', auctions[activeIndex - 1]?.id]);
      } else if (nav === 'next' && activeIndex === 1) {
        this.router.navigate(['/']);
      }
    }),
  ), { dispatch: false });

  constructor(
    private store: Store<GlobalState>,
    private actions$: Actions,
    private router: Router,
    private themeSvc: ThemeService,
    private web3Svc: Web3Service,
    private dataSvc: DataService,
  ) {}
}

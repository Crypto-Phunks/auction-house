import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { Auction, Bid } from '../interfaces/auction';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  subscription!: Subscription;

  private auctionData = new BehaviorSubject<Auction[]>([]);
  public auctionData$ = this.auctionData.asObservable();

  private activeIndex = new BehaviorSubject<number>(0);
  public activeIndex$ = this.activeIndex.asObservable();

  constructor(
    private apollo: Apollo
  ) {
    this.getAuctionData();
  }

  getAuctionData(): void {

    const GET_AUCTIONS = gql`
      {
        auctions(
          orderBy: startTime,
          orderDirection: desc
        ) {
          phunk { id }
          id
          startTime
          endTime
          settled
          amount
          # attributes
          # image
          bidder {
            id
          }
          bids {
            id
            bidder { id }
            amount,
            blockTimestamp
          }
        }
      }
    `;

    this.subscription = this.apollo.query({ query: GET_AUCTIONS }).pipe(
      map((res: any) => res.data?.auctions || []),
      // tap(console.log),
      map((res: any[]) => {
        const auctions: Auction[] = res.map((auction: any) => {
          const bids: Bid[] = [...auction?.bids].sort((a: Bid, b: Bid) => Number(b?.amount) - Number(a?.amount));
          return {
            id: auction.id,
            phunkId: auction?.phunk.id,
            amount: auction?.amount,
            // attributes: this.transformAttributes(auction?.attributes),
            // image: auction?.image,
            startTime: Number(auction?.startTime) * 1000,
            endTime: Number(auction?.endTime) * 1000,
            bidder: auction?.bidder?.id,
            settled: auction?.settled,
            bids
          };
        });
        return auctions;
      }),
      // tap(console.log),
      tap((res: Auction[]) => this.setAuctionData(res))
    ).subscribe(() => this.subscription.unsubscribe());
  }

  public setAuctionData(auctionData: Auction[]) {
    this.auctionData.next(auctionData);
    // console.log(`setAuctionData`, auctionData);
  }

  public setActiveIndex(index: number) {
    this.activeIndex.next(index);
    // console.log(`setActiveIndex`, index);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Util //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public transformAttributes(attributes: string) {
    return attributes.split(', ').map((res: any, i: number) => {
      if (!i) return res.match(/[a-zA-Z]+/g)[0];
      return res;
    });
  }

}
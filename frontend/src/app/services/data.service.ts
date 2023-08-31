import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { Auction, Bid } from '../interfaces/auction';
import { WatchQueryOptions } from '@apollo/client';

const GET_AUCTIONS = gql`
  query GetAuctions($first: Int, $skip: Int) {
    auctions(
      orderBy: startTime
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      startTime
      endTime
      settled
      amount
      phunk {
        id
      }
      bidder {
        id
      }
      bids {
        id
        bidder {
          id
        }
        amount,
        blockTimestamp
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})

export class DataService {

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

    // this.apollo.watchQuery({ query: GET_AUCTIONS }).valueChanges.

    const query: WatchQueryOptions = {
      query: GET_AUCTIONS,
      variables: {
        first: 300,
        skip: 0
      },
      pollInterval: 10000
    };

    this.apollo.watchQuery(query).valueChanges.pipe(
      map((res: any) => res.data?.auctions || []),
      tap((res) => console.log(`getAuctionData`, {res})),
      map((res: any) => transformData(res)),
      // tap(console.log),
      tap((res: Auction[]) => this.setAuctionData(res))
    ).subscribe();

    function transformData(data: any) {
      const auctions: Auction[] = data.map((auction: any) => {
        const bids: Bid[] = [ ...auction?.bids ].sort((a: Bid, b: Bid) => Number(b?.amount) - Number(a?.amount));
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
    }
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

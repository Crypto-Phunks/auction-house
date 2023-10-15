import { Injectable } from '@angular/core';

import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap } from 'rxjs';

import { Auction, Bid } from '../interfaces/auction';

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

  constructor(
    private apollo: Apollo
  ) {
    // this.getAuctionData();
  }

  fetchAuctionData(): Observable<Auction[]> {
    const watchQuery = (first: number, skip: number): any => ({
      query: GET_AUCTIONS,
      variables: { first, skip },
      pollInterval: 5000
    });

    return this.apollo.watchQuery(watchQuery(365, 0)).valueChanges.pipe(
      map((res) => this.transformAuctionData(res))
    );
  }

  transformAuctionData(res: any): Auction[] {
    if (!res || !res.data?.auctions) return [];

    const data = res.data?.auctions;
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

  // mergeAuctionData(newAuctionData: Auction[]) {
  //   const currentAuctionData = this.auctionData.getValue();
  //   const mergedData: Auction[] = [...currentAuctionData];

  //   for (const newAuction of newAuctionData) {
  //     const index = mergedData.findIndex(auction => auction.id === newAuction.id);
  //     if (index !== -1) mergedData[index] = newAuction;
  //     else mergedData.unshift(newAuction);
  //   }

  //   mergedData.sort((a: Auction, b: Auction) => Number(b.startTime) - Number(a.startTime));
  // }

  // setActiveIndex(index: number) {
  //   this.activeIndex.next(index);
  // }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Util //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  transformAttributes(attributes: string) {
    return attributes.split(', ').map((res: any, i: number) => {
      if (!i) return res.match(/[a-zA-Z]+/g)[0];
      return res;
    });
  }

}

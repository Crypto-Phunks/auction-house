import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { environment } from 'src/environments/environment';

import { BigNumber, ethers, Event, Transaction } from 'ethers';
import { firstValueFrom } from 'rxjs';

import { Auction, Bid } from '../interfaces/auction';

@Injectable({
  providedIn: 'root'
})

export class StateService {

  provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(environment.httpRpc);

  constructor(
    private dataSvc: DataService
  ) {}

  async updateAuctionCreated(
    phunkId: BigNumber,
    id: BigNumber,
    startTime: BigNumber,
    endTime: BigNumber,
    attributes: string,
    image: string
  ): Promise<void> {

    console.log(`updateAuctionCreated`, Number(id))

    let { auctionData, auctionIndex } = await this.getAuctionIndexAndData(id);

    if (auctionIndex > -1) {
      auctionData[auctionIndex] = {
        ...auctionData[auctionIndex],
        startTime: Number(startTime) * 1000,
        endTime: Number(endTime) * 1000,
        // attributes: this.dataSvc.transformAttributes(attributes),
        // image
      };
    } else {
      auctionData.unshift({
        id: Number(id).toString(),
        phunkId: Number(phunkId).toString(),
        amount: '0',
        // attributes: this.dataSvc.transformAttributes(attributes),
        // image,
        startTime: Number(startTime) * 1000,
        endTime: Number(endTime) * 1000,
        bidder: null,
        settled: false,
        bids: []
      });
    }

    console.log(auctionData);
    this.dataSvc.setAuctionData(auctionData);
  }

  async updateAuctionSettled(
    phunkId: BigNumber,
    id: BigNumber,
    winner: string,
    amount: BigNumber
  ): Promise<void> {

    console.log(`updateAuctionSettled`, Number(id))

    let { auctionData, auctionIndex } = await this.getAuctionIndexAndData(id);

    if (auctionIndex > -1) {
      auctionData[auctionIndex] = {
        ...auctionData[auctionIndex],
        bidder: winner,
        amount: Number(amount).toString(),
        settled: true,
      };

      console.log(auctionData);
      this.dataSvc.setAuctionData(auctionData);
    }
  }

  async updateAuctionExtended(
    phunkId: BigNumber,
    id: BigNumber,
    endTime: BigNumber
  ): Promise<void> {

    await this.delay(.25);

    console.log(`updateAuctionExtended`, Number(id))

    let { auctionData, auctionIndex } = await this.getAuctionIndexAndData(id);

    if (auctionIndex > -1) {
      auctionData[auctionIndex] = {
        ...auctionData[auctionIndex],
        endTime: Number(endTime) * 1000
      };
  
      console.log(auctionData);
      this.dataSvc.setAuctionData(auctionData);
    }
  }

  async updateAuctionBid(
    phunkId: BigNumber,
    id: BigNumber,
    sender: string,
    value: BigNumber,
    extended: boolean,
    event: Event
  ): Promise<void> {

    console.log(`updateAuctionBid`, Number(id))

    let { auctionData, auctionIndex } = await this.getAuctionIndexAndData(id);
    const { bids, exists } = this.getBidExists(auctionData[auctionIndex], value);

    if (!exists) {
      const { timestamp } = (await event.getBlock());
      
      bids.push({
        id: event.transactionHash,
        bidder: { id: sender },
        amount: Number(value).toString(),
        blockTimestamp: timestamp.toString()
      });

      const newBids: Bid[] = [...bids].sort((a: Bid, b: Bid) => Number(b?.amount) - Number(a?.amount));
      
      auctionData[auctionIndex] = {
        ...auctionData[auctionIndex],
        amount: Number(value).toString(),
        bidder: sender,
        bids: newBids,
      }

      console.log(auctionData);
      this.dataSvc.setAuctionData(auctionData);
    }
  }

  // UTIL
  async getAuctionIndexAndData(id: BigNumber): Promise<{ auctionData: Auction[], auctionIndex: number }> {
    const auctionData: Auction[] = await firstValueFrom(this.dataSvc.auctionData$);
    const auctionItem = auctionData.filter((auction: any) => Number(auction.id) === Number(id))[0];
    const auctionIndex = auctionData.indexOf(auctionItem);
    return { auctionData, auctionIndex };
  }

  getBidExists(auction: Auction, value: BigNumber): { bids: Bid[], exists: boolean } {
    const bidItem = auction.bids.filter((bid: Bid) => bid?.amount === Number(value).toString())[0];
    const bidIndex = auction.bids.indexOf(bidItem);
    return { bids: auction.bids, exists: bidIndex > -1};
  }

  async delay(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
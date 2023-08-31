import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { environment } from 'src/environments/environment';

import { ethers, Event } from 'ethers';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { Auction, Bid } from '../interfaces/auction';
import { Treasury } from '@/interfaces/treasury';

@Injectable({
  providedIn: 'root'
})

export class StateService {

  private web3Connected = new BehaviorSubject<boolean>(false);
  web3Connected$ = this.web3Connected.asObservable();

  private walletAddress = new BehaviorSubject<string | null>(null);
  walletAddress$ = this.walletAddress.asObservable();

  private treasury = new BehaviorSubject<Treasury | null>(null);
  treasury$ = this.treasury.asObservable();

  provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(environment.httpRpc);

  constructor(
    private dataSvc: DataService
  ) {}

  async updateTreasuryBalance(treasury: Treasury): Promise<void> {
    this.treasury.next(treasury);
  }

  async updateAuctionCreated(
    phunkId: bigint,
    id: bigint,
    startTime: bigint,
    endTime: bigint,
    attributes: string,
    image: string
  ): Promise<void> {

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
    phunkId: bigint,
    id: bigint,
    winner: string,
    amount: bigint
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
    phunkId: bigint,
    id: bigint,
    endTime: bigint
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
    phunkId: bigint,
    id: bigint,
    sender: string,
    value: bigint,
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
  async getAuctionIndexAndData(id: bigint): Promise<{ auctionData: Auction[], auctionIndex: number }> {
    const auctionData: Auction[] = await firstValueFrom(this.dataSvc.auctionData$);
    const auctionItem = auctionData.filter((auction: any) => Number(auction.id) === Number(id))[0];
    const auctionIndex = auctionData.indexOf(auctionItem);
    return { auctionData, auctionIndex };
  }

  getBidExists(auction: Auction, value: bigint): { bids: Bid[], exists: boolean } {
    const bidItem = auction.bids.filter((bid: Bid) => bid?.amount === value.toString())[0];
    const bidIndex = auction.bids.indexOf(bidItem);
    return { bids: auction.bids, exists: bidIndex > -1};
  }

  async delay(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  setWeb3Connected(connected: boolean): void {
    this.web3Connected.next(connected);
  }

  getWeb3Connected(): boolean {
    return this.web3Connected.getValue();
  }

  setWalletAddress(address: string | null): void {
    this.walletAddress.next(address);
  }

  getWalletAddress(): string | null {
    return this.walletAddress.getValue();
  }
}

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

  async getAuctionIndexAndData(id: bigint): Promise<{ auctionData: Auction[], auctionIndex: number }> {
    const auctionData: Auction[] = await firstValueFrom(this.dataSvc.auctionData$);
    const auctionItem = auctionData.filter((auction: any) => Number(auction.id) === Number(id))[0];
    const auctionIndex = auctionData.indexOf(auctionItem);
    return { auctionData, auctionIndex };
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

  updateTreasuryBalance(treasury: Treasury): void {
    this.treasury.next(treasury);
  }
}

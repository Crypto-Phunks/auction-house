import { Injectable } from '@nestjs/common';

import { createPublicClient, formatUnits, http } from 'viem'
import { goerli, mainnet } from 'viem/chains'

import { auctionHouse } from 'src/abi/AuctionHouseABI';
import { punkData } from 'src/abi/PunkData';

import { Auction, AuctionLog } from 'src/interfaces/auction.interface';

import { BehaviorSubject } from 'rxjs';

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class Web3Service {

  private auctionBid = new BehaviorSubject<AuctionLog | null>(null);
  auctionBid$ = this.auctionBid.asObservable();

  private auctionCreated = new BehaviorSubject<AuctionLog | null>(null);
  auctionCreated$ = this.auctionCreated.asObservable();

  client = createPublicClient({
    chain: goerli,
    transport: http(process.env.RPC_URL),
  });

  constructor() {

    this.client.watchContractEvent({
      address: auctionHouse.address as `0x${string}`,
      abi: auctionHouse.abi,
      eventName: 'AuctionCreated',
      onLogs: (logs: any[] /* wtf viem */) => this.auctionCreated.next(logs[0] as AuctionLog)
    });

    this.client.watchContractEvent({
      address: auctionHouse.address as `0x${string}`,
      abi: auctionHouse.abi,
      eventName: 'AuctionBid',
      onLogs: (logs: any[] /* wtf viem */) => this.auctionBid.next(logs[0] as AuctionLog)
    });
  }

  async getCurrentAuction(): Promise<Auction> {
    const res = await this.client.readContract({
      address: auctionHouse.address as `0x${string}`,
      abi: auctionHouse.abi,
      functionName: 'auction',
      args: [],
    });

    return {
      phunkId: res[0] as bigint,
      amount: res[1],
      startTime: res[2],
      endTime: res[3],
      bidder: res[4],
      settled: res[5],
      auctionId: res[6],
    };
  }

  async getPunkImage(phunkId: string): Promise<string> {
    return await this.client.readContract({
      address: punkData.address as `0x${string}`,
      abi: punkData.abi,
      functionName: 'punkImage',
      args: [phunkId],
    }) as string;
  }

  async getPunkAttributes(phunkId: string): Promise<string> {
    return await this.client.readContract({
      address: punkData.address as `0x${string}`,
      abi: punkData.abi,
      functionName: 'punkAttributes',
      args: [phunkId],
    }) as string;
  }

  async getTransactionReceipt(hash: `0x${string}`) {
    return await this.client.getTransactionReceipt({ hash });
  }

  async getEnsFromAddress(address: `0x${string}`): Promise<string> {
    return await this.client.getEnsName({ address });
  }

  weiToEth(wei: bigint): string {
    return formatUnits(wei, 18);
  }

}
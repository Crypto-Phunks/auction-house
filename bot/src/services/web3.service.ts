import { Injectable } from '@nestjs/common';

import auctionABI from '../abi/AuctionHouseABI.json';
import punkDataABI from '../abi/PunkData.json';

import { createPublicClient, formatUnits, http } from 'viem'
import { goerli, mainnet } from 'viem/chains'

import { Auction, AuctionLog } from 'src/interfaces/auction.interface';

import dotenv from 'dotenv';
import { BehaviorSubject } from 'rxjs';
dotenv.config();

const auctionContractAddress = process.env.AUCTION_CONTRACT_ADDRESS;
const punkDataAddress = process.env.PUNK_DATA_ADDRESS;

@Injectable()
export class Web3Service {

  private auctionBid = new BehaviorSubject<AuctionLog | null>(null);
  auctionBid$ = this.auctionBid.asObservable();

  private auctionCreated = new BehaviorSubject<AuctionLog | null>(null);
  auctionCreated$ = this.auctionCreated.asObservable();

  public client = createPublicClient({
    chain: goerli,
    transport: http(process.env.RPC_URL),
  });

  constructor() {

    this.client.watchContractEvent({
      address: auctionContractAddress as `0x${string}`,
      abi: auctionABI,
      eventName: 'AuctionCreated',
      onLogs: (logs: any[] /* wtf viem */) => this.auctionCreated.next(logs[0] as AuctionLog)
    });

    this.client.watchContractEvent({
      address: auctionContractAddress as `0x${string}`,
      abi: auctionABI,
      eventName: 'AuctionBid',
      onLogs: (logs: any[] /* wtf viem */) => this.auctionBid.next(logs[0] as AuctionLog)
    });
  }

  async getCurrentAuction(): Promise<Auction> {
    const res = await this.client.readContract({
      address: auctionContractAddress as `0x${string}`,
      abi: auctionABI,
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
      address: punkDataAddress as `0x${string}`,
      abi: punkDataABI,
      functionName: 'punkImage',
      args: [phunkId],
    }) as string;
  }

  async getPunkAttributes(phunkId: string): Promise<string> {
    return await this.client.readContract({
      address: punkDataAddress as `0x${string}`,
      abi: punkDataABI,
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
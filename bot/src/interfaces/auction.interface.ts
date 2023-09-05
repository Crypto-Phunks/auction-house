export interface NewAuctionEvent {
  phunkId: bigint;
  auctionId: bigint;
  startTime: bigint;
  endTime: bigint;
}

export interface BidEvent {
  phunkId: bigint;
  auctionId: bigint;
  sender: `0x${string}`;
  value: bigint;
  extended: boolean;
}

export interface AuctionLog {
  address: string;
  blockHash: string;
  blockNumber: bigint;
  data: string;
  logIndex: number;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
  args: NewAuctionEvent | BidEvent;
  eventName: string;
}

export interface Auction {
  phunkId: bigint;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  bidder: `0x${string}`;
  settled: boolean;
  auctionId: bigint;
}
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

export type Auction = [
  phunkId: bigint,
  amount: bigint,
  startTime: bigint,
  endTime: bigint,
  address: `0x${string}`,
  settled: boolean,
  auctionId: bigint,
]
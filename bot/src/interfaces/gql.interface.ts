export interface Bidder {
  id: string;
}

export interface Phunk {
  id: string;
}

export interface Bid {
  amount: string;
}

export interface AuctionData {
  id: string;
  amount: string;
  endTime: string;
  startTime: string;
  settled: boolean;
  bidder: Bidder;
  phunk: Phunk;
  bids: Bid[];
}
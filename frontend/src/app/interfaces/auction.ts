export interface Auction {
  id: string
  phunkId: string
  amount: string
  // attributes: Array<string>
  // image: string
  startTime: number
  endTime: number
  bidder: string | undefined | null
  settled: boolean
  bids: Bid[]
}

export interface Bid {
  id?: string
  bidder?: { id: string }
  amount?: string
  blockTimestamp?: string
}
import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AuctionCreated,
  AuctionBid,
  AuctionExtended,
  AuctionSettled,
} from '../generated/PhunksAuctionHouse/PhunksAuctionHouse';

import { Phunk, Auction, Bid, Account } from '../generated/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleAuctionCreated(event: AuctionCreated): void {
  let phunkId = event.params.phunkId.toString();

  let phunk = Phunk.load(phunkId);
  if (phunk == null) {
    log.error('[handleAuctionCreated] Phunk #{} not found. Hash: {}', [
      phunkId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let auctionId = event.params.auctionId.toString();
  let auction = new Auction(auctionId);

  auction.phunk = phunk.id;
  auction.id = auctionId;
  auction.blockNumber = event.block.number;
  auction.amount = BigInt.fromI32(0);
  // auction.attributes = event.params.attributes;
  // auction.image = event.params.image.toHexString();
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  auction.save();
}

export function handleAuctionBid(event: AuctionBid): void {
  let bidderAddress = event.params.sender.toHex();
  let auctionId = event.params.auctionId.toString();

  let bidder = getOrCreateAccount(bidderAddress);

  let auction = Auction.load(auctionId);
  if (auction == null) {
    log.error('[handleAuctionBid] Auction not found for Auction #{}. Hash: {}', [
      auctionId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidderAddress;
  bid.amount = auction.amount;
  bid.phunk = auction.phunk;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  let auctionId = event.params.auctionId.toString();

  let auction = Auction.load(auctionId);
  if (auction == null) {
    log.error('[handleAuctionExtended] Auction not found for Auction #{}. Hash: {}', [
      auctionId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.endTime = event.params.endTime;
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {
  let auctionId = event.params.auctionId.toString();

  let auction = Auction.load(auctionId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for Auction #{}. Hash: {}', [
      auctionId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.settled = true;
  auction.save();
}

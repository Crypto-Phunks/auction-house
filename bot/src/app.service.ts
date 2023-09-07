import { Injectable, Logger } from '@nestjs/common';

import { Web3Service } from './services/web3.service';
import { ImageService } from './services/image.service';
import { DiscordService } from './services/discord.service';
import { PushService } from './services/push.service';
import { SupabaseService } from './services/supabase.service';

import { format, fromUnixTime } from 'date-fns'
import { catchError, from, interval, of, switchMap } from 'rxjs';

import { Message } from './interfaces/message.interface';
import { AuctionTimer } from './interfaces/timers.interface';
import { Auction, AuctionLog, BidEvent, NewAuctionEvent } from './interfaces/auction.interface';

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AppService {

  completeAuctions = [];

  timer24: any;
  timer6: any;
  timer1: any;
  
  constructor(
    private readonly web3Svc: Web3Service,
    private readonly imgSvc: ImageService,
    private readonly discordSvc: DiscordService,
    private readonly pushSvc: PushService,
    private readonly spbSvc: SupabaseService
  ) {

    // Watch for new auctions
    this.web3Svc.auctionCreated$.subscribe((log) => {
      if (!log) return;
      const { phunkId, auctionId, startTime, endTime } = log.args as NewAuctionEvent;
      this.onAuctionCreated(phunkId, auctionId, startTime, endTime, log);
    });

    // Watch for new bids
    this.web3Svc.auctionBid$.subscribe((log) => {
      if (!log) return;
      const { phunkId, auctionId, sender, value, extended } = log.args as BidEvent;
      this.onAuctionBid(phunkId, auctionId, sender, value, extended, log);
    });
    
    // Watch for ended auctions
    // May miss in the 10sec window
    interval(10000).pipe(
      switchMap(() => from(this.web3Svc.getCurrentAuction())),
      switchMap((auction) => {
        const timeLeft = this.getTimeLeft(auction.endTime);
        if (timeLeft < 0 && !this.completeAuctions.includes(auction.auctionId)) return from(this.onAuctionWon(auction));
        return of(auction);
      }),
      catchError((error) => {
        Logger.error(error, 'interval()');
        return of(null);
      })
    ).subscribe();
  }

  async onAuctionWon(auction: Auction): Promise<void> {
    if (!auction) return;

    const image = await this.imgSvc.createImage(this.pad(auction.phunkId.toString()));
    const ens = await this.web3Svc.getEnsFromAddress(auction.bidder);
    
    const title = `📢 Phunk #${auction.phunkId.toString()} has been sold for Ξ${this.web3Svc.weiToEth(auction.amount)}!`;

    const discordText = `Top Bidder: ${ens ?? this.shortenAddress(auction.bidder)}`;
    const pushText = `Top Bidder: ${ens ?? this.shortenAddress(auction.bidder)}`;

    this.completeAuctions.push(auction.auctionId);
    this.sendNotification({ discordText, pushText, title, image, tokenId: auction.phunkId.toString() });

    Logger.log(
      `Auction ended (won) for Phunk #${auction.phunkId.toString()}`,
      'onAuctionWon()'
    );
  }

  async onAuctionCreated(
    tokenId: bigint,
    auctionId: bigint,
    startTime: bigint,
    endTime: bigint,
    log: AuctionLog
  ): Promise<void> {
    this.setTimers(endTime);

    const date = fromUnixTime(Number(endTime));
    const timeLeft = this.convertTimeLeft(endTime);

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));

    const receipt = await this.web3Svc.getTransactionReceipt(log.transactionHash as `0x${string}`);
    const ens = await this.web3Svc.getEnsFromAddress(receipt?.from);

    const title = `📢 Phunk #${tokenId.toString()} has been put up for auction!`;
    
    const discordText = `Started by: ${ens ?? this.shortenAddress(receipt?.from)}\nAuction Ends: ${format(date, 'PPpp')} GMT\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;
    
    const pushText = `Started by: ${ens ?? this.shortenAddress(receipt?.from)}\nAuction Ends: ${format(date, 'PPpp')} GMT\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });

    Logger.log(
      `Auction created for Phunk #${tokenId.toString()}`,
      'onAuctionCreated()'
    );
  }

  async onAuctionBid(
    tokenId: bigint,
    auctionId: bigint,
    sender: `0x${string}`,
    value: bigint,
    extended: boolean,
    log: AuctionLog
  ): Promise<void> {

    const auction = await this.web3Svc.getCurrentAuction();
    const timeLeft = this.convertTimeLeft(auction[3]);

    this.setTimers(auction[3]);

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));
    const ens = await this.web3Svc.getEnsFromAddress(sender);

    const title = `📢 Phunk #${tokenId.toString()} has a new bid of Ξ${this.web3Svc.weiToEth(value)}!`;

    const discordText = `From: ${ens ?? this.shortenAddress(sender)}\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;

    const pushText = `From: ${ens ?? this.shortenAddress(sender)}\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });

    Logger.log(
      `New bid of Ξ${this.web3Svc.weiToEth(value)} for Phunk #${tokenId.toString()}`,
      'onAuctionBid()'
    );
  }

  async sendNotification(data: Message): Promise<void> {
    if (Number(process.env.DISCORD_ENABLED)) this.discordSvc.postMessage(data);
    try {
      if (!Number(process.env.PUSH_ENABLED)) throw new Error('Push notifications are disabled.');
      const subscriptions = await this.spbSvc.getSubscriptions('all');
      if (!subscriptions.length) throw new Error('No push notification tokens found.');
      const send = await this.pushSvc.sendPushNotification(data, subscriptions);

      Logger.log(
        `Push notification sent to ${send?.successCount} devices and failed on ${send?.failureCount} devices.`,
        'sendNotification()'
      );
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // TIMERS //////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  setTimers(endTime: bigint) {

    clearTimeout(this.timer24);
    clearTimeout(this.timer6);
    clearTimeout(this.timer1);

    const timestamp = Number(endTime) * 1000;

    const now = Date.now();
    const diff = timestamp - now;

    const time24 = 86400000;
    const time6 = 21600000;
    const time1 = 3600000;

    if (diff > 0) {
      if (diff > time24) {
        Logger.debug('Starting 24 hour timer');
        this.timer24 = setTimeout(() => this.onTimer(), diff - time24);
      }

      if (diff > time6) {
        Logger.debug('Starting 6 hour timer');
        this.timer6 = setTimeout(() => this.onTimer(), diff - time6);
      }

      if (diff > time1) {
        Logger.debug('Starting 1 hour timer');
        this.timer1 = setTimeout(() => this.onTimer(), diff - time1);
      }
    }
  }

  async onTimer(): Promise<void> {
    const auction = await this.web3Svc.getCurrentAuction();
    const timeLeft = this.convertTimeLeft(auction.endTime);
    const tokenId = auction.phunkId;

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));

    const title = `📢 The auction for Phunk #${tokenId.toString()} is ending soon!`;
    
    const discordText = `Time remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;

    const pushText = `Time remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });
  }

  getTimeLeft(endTime: bigint) {
    const now = Date.now();
    const diff = (Number(endTime) * 1000) - now;
    return diff;
  }

  convertTimeLeft(time: bigint): AuctionTimer {
    const padWithZero = (n: number, t: number) => String(n).padStart(t, '0');
    
    const diff = this.getTimeLeft(time);

    // Time calculations for days, hours, minutes and seconds
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const days = padWithZero(d, 2);
    const hours = padWithZero(h, 2);
    const minutes = padWithZero(m, 2);
    const seconds = padWithZero(s, 2);

    return { days, hours, minutes, seconds };
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // Utils ///////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  pad = (tokenId: string) => tokenId.padStart(4, '0');

  shortenAddress(address: string): string {
    const shortAddress = `${address.slice(0, 5)}...${address.slice(address.length - 5, address.length)}`;
    if (address.startsWith('0x')) return shortAddress;
    return address;
  }

}

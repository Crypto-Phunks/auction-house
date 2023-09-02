import { Injectable, Logger } from '@nestjs/common';

import { Web3Service } from './services/web3.service';
import { ImageService } from './services/image.service';
import { DiscordService } from './services/discord.service';
import { PushService } from './services/push.service';
import { SupabaseService } from './services/supabase.service';

import { format, fromUnixTime } from 'date-fns'
import { BigNumber, Event } from 'ethers';

import { Message } from './interfaces/message.interface';

import dotenv from 'dotenv';
dotenv.config();

interface Time {
  days: string,
  hours: string,
  minutes: string,
  seconds: string
}

@Injectable()
export class AppService {

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

    this.web3Svc.auctionHouseContract.on('AuctionCreated', (
      phunkId: BigNumber,
      auctionId: BigNumber,
      startTime: BigNumber,
      endTime: BigNumber,
      event: Event
    ) => {
      this.onAuctionCreated(phunkId, auctionId, startTime, endTime, event);
      // console.log({ phunkId, id: Number(auctionId), startTime, endTime, event });
    });

    this.web3Svc.auctionHouseContract.on('AuctionBid', (
      phunkId: BigNumber,
      auctionId: BigNumber,
      sender: string,
      value: BigNumber,
      extended: boolean,
      event: Event
    ) => {
      this.onAuctionBid(phunkId, auctionId, sender, value, extended, event);
      // console.log({ phunkId, id: Number(auctionId), sender, value, extended, event });
    });

    this.web3Svc.auctionHouseContract['auction']().then(({ endTime }) => {
      this.setTimers(endTime);
    });
  }

  async onAuctionCreated(
    tokenId: BigNumber,
    auctionId: BigNumber,
    startTime: BigNumber,
    endTime: BigNumber,
    event: Event
  ): Promise<void> {

    this.setTimers(endTime);

    const date = fromUnixTime(Number(endTime));
    const timeLeft = this.convertTimeLeft(endTime);

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));

    const receipt = await event.getTransactionReceipt();
    const ens = await this.web3Svc.provider.lookupAddress(receipt?.from);

    const title = `📢 Phunk #${tokenId.toString()} has been put up for auction!`;
    
    const discordText = `Started by: ${ens ?? this.shortenAddress(receipt?.from)}\nAuction Ends: ${format(date, 'PPpp')} GMT\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;
    
    const pushText = `Started by: ${ens ?? this.shortenAddress(receipt?.from)}\nAuction Ends: ${format(date, 'PPpp')} GMT\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });

    // await writeFile(`./phunk${this.pad(phunkId.toString())}.png`, image, 'base64');
  }

  async onAuctionBid(
    tokenId: BigNumber,
    auctionId: BigNumber,
    sender: string,
    value: BigNumber,
    extended: boolean,
    event: Event
  ): Promise<void> {

    const auction = await this.web3Svc.auctionHouseContract['auction']();
    const timeLeft = this.convertTimeLeft(auction.endTime);

    this.setTimers(auction.endTime);

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));
    const ens = await this.web3Svc.provider.lookupAddress(sender);

    const title = `📢 Phunk #${tokenId.toString()} has a new bid of Ξ${this.web3Svc.weiToEth(value)}!`;

    const discordText = `From: ${ens ?? this.shortenAddress(sender)}\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;

    const pushText = `From: ${ens ?? this.shortenAddress(sender)}\n\nTime remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });

    // await writeFile(`./phunk${this.pad(phunkId.toString())}.png`, image, 'base64');
  }

  async onTimer(): Promise<void> {
    const auction = await this.web3Svc.auctionHouseContract['auction']();
    const timeLeft = this.convertTimeLeft(auction.endTime);
    const tokenId = auction.phunkId;

    const image = await this.imgSvc.createImage(this.pad(tokenId.toString()));

    const title = `📢 The auction for Phunk #${tokenId.toString()} is ending soon!`;
    
    const discordText = `Time remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds\n\n' : ''}`;

    const pushText = `Time remaining:\n${timeLeft.days !== '00' ? timeLeft.days + ' days\n' : ''}${timeLeft.hours !== '00' ? timeLeft.hours + ' hours\n' : ''}${timeLeft.minutes !== '00' ? timeLeft.minutes + ' minutes\n' : ''}${timeLeft.seconds !== '00' ? timeLeft.seconds + ' seconds' : ''}`;

    this.sendNotification({ discordText, pushText, title, image, tokenId: tokenId.toString() });
  }

  setTimers(endTime: BigNumber) {

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

  async sendNotification(data: Message): Promise<void> {
  
    this.discordSvc.postMessage(data);

    try {
      if (!Number(process.env.PUSH_ENABLED)) throw new Error('Push notifications are disabled.');
      const tokens = await this.spbSvc.getSubscriptionTokens('all');
      const send = await this.pushSvc.sendPushNotification(data, tokens);
      console.log(send);
    } catch (error) {
      console.log(error);
    }
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

  convertTimeLeft(time: BigNumber): Time {
    const padWithZero = (n: number, t: number) => String(n).padStart(t, '0');

    const now = Date.now();
    const diff = (Number(time) * 1000) - now;

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

}

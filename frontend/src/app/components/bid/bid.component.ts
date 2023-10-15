import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Store } from '@ngrx/store';

import { Web3Service } from '@/services/web3.service';

import { TimerComponent } from '@/components/timer/timer.component';
import { BidHistoryComponent } from '@/components/bid-history/bid-history.component';

import { WeiPipe } from '@/pipes/wei.pipe';
import { MinBidPipe } from '@/pipes/min-bid.pipe';

import { TippyDirective } from '@/directives/tippy.directive';

import { GlobalState } from '@/interfaces/global-state';

import * as selectors from '@/state/selectors/app-state.selector';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    TimerComponent,
    BidHistoryComponent,

    TippyDirective,

    WeiPipe,
    MinBidPipe
  ],
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})

export class BidComponent {

  @Input() currentAuction!: any;

  bidValue = new FormControl<number | null>(null);

  auctionComplete: boolean = false;
  auctionClosed!: boolean;

  inputError!: boolean;
  errorMessage!: string | null;
  txHash!: `0x${string}` | string | null | undefined;

  web3Connected$ = this.store.select(selectors.selectConnected);
  theme$ = this.store.select(selectors.selectTheme);

  constructor(
    private store: Store<GlobalState>,
    public web3Svc: Web3Service,
  ) {}

  async startNewAuction(): Promise<void> {
    this.closeTransaction();
    this.closeError();

    try {
      await this.web3Svc.checkNetwork();

      this.txHash = await this.web3Svc.startNewAuction();
      this.resetBid();

      // Wait for the tx to be mined
      if (!this.txHash) throw new Error('Transaction failed');
      await this.web3Svc.waitForTransaction(this.txHash);

      this.closeTransaction();
      this.closeError();

    } catch (err: any) {
      console.log(err?.message);
      this.errorMessage = err.error?.message;
    }
  }

  async submitBid(): Promise<void> {
    this.closeTransaction();
    this.closeError();

    try {
      await this.web3Svc.checkNetwork();
      // Bid value
      const bidValue: number | null = this.bidValue.value;
      if (!bidValue) throw new Error('You must enter a bid value');

      // Get the current active auction
      const currentAuction = await this.web3Svc.getCurrentAuction();
      const tokenId = (currentAuction as any)[0] as bigint;

      // Send the tx
      this.txHash = await this.web3Svc.setBid(tokenId, bidValue);
      this.resetBid();

      // Wait for the tx to be mined
      if (!this.txHash) throw new Error('Transaction failed');
      await this.web3Svc.waitForTransaction(this.txHash);

      this.closeTransaction();
      this.closeError();

    } catch (err: any) {
      // console.log(err);
      this.errorMessage = err.error?.message || err.message;
    }
  }

  setInputError(err: any) {
    this.inputError = true;
    this.errorMessage = err;
  }

  resetBid(): void {
    this.bidValue.reset();
  }

  handleEvent($event: any): void {
    // console.log($event)
    this.auctionComplete = $event.left > 0 ? false : true;
    this.auctionClosed = this.currentAuction?.end * 1000 < Date.now();
  }

  closeTransaction() {
    this.txHash = null;
  }

  closeError() {
    this.errorMessage = null;
  }

}

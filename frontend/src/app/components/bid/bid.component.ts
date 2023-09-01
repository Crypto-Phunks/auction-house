import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DataService } from 'src/app/services/data.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})

export class BidComponent implements OnInit, AfterViewInit {

  @Input() currentAuction!: any;
  @Input() backgroundColor!: string;

  bidValue = new FormControl('');

  auctionComplete: boolean = false;
  auctionClosed!: boolean;

  inputError!: boolean;
  errorMessage!: string | null;
  txHash!: string | null;

  constructor(
    public dataSvc: DataService,
    public web3Svc: Web3Service,
    public themeSvc: ThemeService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async startNewAuction(): Promise<void> {
    this.closeTransaction();
    this.closeError();

    try {
      await this.web3Svc.checkNetwork();
      const transaction = await this.web3Svc.startNewAuction();

      this.txHash = transaction.hash;
      this.resetBid();

      await transaction.wait();
      this.closeTransaction();
      this.closeError();

    } catch (err: any) {
      console.log(err?.message);
      this.errorMessage = err.error.message;
    }
  }

  async submitBid(): Promise<void> {
    this.closeTransaction();
    this.closeError();

    try {
      await this.web3Svc.checkNetwork();
      // Bid value
      const bidValue: number = this.bidValue.value;
      if (!bidValue) throw new Error('You must enter a bid value');
      
      // Get the current active auction
      const currentAuction = await this.web3Svc.getCurrentAuction();

      // Send the tx
      const transaction = await this.web3Svc.setBid(currentAuction.phunkId, bidValue);
      this.txHash = transaction.hash;
      this.resetBid();

      await transaction.wait();
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

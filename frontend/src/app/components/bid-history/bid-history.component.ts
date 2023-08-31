import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { DataService } from '@/services/data.service';
import { EthAddressDirective } from '@/directives/eth-address.directive';
import { WeiPipe } from '@/pipes/wei.pipe';

import { environment } from 'src/environments/environment';

@Component({
  standalone: true,
  imports: [
    CommonModule,

    EthAddressDirective,

    WeiPipe
  ],
  selector: 'app-bid-history',
  templateUrl: './bid-history.component.html',
  styleUrls: ['./bid-history.component.scss']
})

export class BidHistoryComponent implements OnInit {

  @Input() currentAuction!: any;
  @Input() auctionBids!: any;

  viewAllBids!: boolean;

  etherscanLink: string = `https://${environment.chainId === 5 ? 'goerli' + '.' : ''}etherscan.io`;

  constructor(
    public dataSvc: DataService
  ) {}

  ngOnInit(): void {}

}

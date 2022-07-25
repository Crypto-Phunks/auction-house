import { Component, Input, OnInit } from '@angular/core';

import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bid-history',
  templateUrl: './bid-history.component.html',
  styleUrls: ['./bid-history.component.scss']
})

export class BidHistoryComponent implements OnInit {

  @Input() currentAuction!: any;
  @Input() auctionBids!: any;

  viewAllBids!: boolean;

  etherscanLink: string = `https://${environment.network === 'rinkeby' ? environment.network + '.' : ''}etherscan.io`;

  constructor(
    public dataSvc: DataService
  ) {}

  ngOnInit(): void {}

}

import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { Web3Service } from '../services/web3.service';

@Pipe({
  standalone: true,
  name: 'minBid'
})

export class MinBidPipe implements PipeTransform {

  constructor(
    private web3Svc: Web3Service,
    private decimal: DecimalPipe
  ) {}

  transform(value: string, percentage: number): any {
    const increment = Number(value) / (100 / percentage);
    const minBid = Number(value) + increment;
    const minBidBigint = BigInt(minBid);
    const ether = this.web3Svc.weiToEth(minBidBigint);

    return `Ξ${this.decimal.transform(ether, '0.1-4')} +`;
  }

}

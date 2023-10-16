import { Pipe, PipeTransform } from '@angular/core';
import { Web3Service } from '../services/web3.service';

@Pipe({
  standalone: true,
  name: 'wei'
})
export class WeiPipe implements PipeTransform {

  constructor(
    private web3Svc: Web3Service
  ) {}

  transform(value: string): string {
    if (!value) return '0';

    const eth = this.web3Svc.weiToEth(value);
    return Number(eth).toFixed(3);
  }
}

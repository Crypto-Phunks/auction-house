import { Pipe, PipeTransform } from '@angular/core';
import { Web3Service } from '../services/web3.service';

@Pipe({
  name: 'wei'
})
export class WeiPipe implements PipeTransform {

  constructor(
    private web3Svc: Web3Service
  ) {}

  transform(value: string): number {
    const eth = value ? this.web3Svc.weiToEth(`${value}`) : '0';
    if (parseFloat(eth) > .99) {
      return eth.includes('.') ? Number(parseFloat(eth).toFixed(2)) : parseFloat(eth);
    }
    return eth.includes('.') ? Number(parseFloat(eth).toFixed(3)) : parseFloat(eth);
  }

}

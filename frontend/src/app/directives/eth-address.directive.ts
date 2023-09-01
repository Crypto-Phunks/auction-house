import { Directive, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Web3Service } from '../services/web3.service';

import { environment } from '../../environments/environment';

@Directive({
  selector: 'eth-address'
})

export class EthAddressDirective implements OnInit, OnDestroy {

  @Input() address!: string;
  @Input() clickable!: boolean;
  
  element!: HTMLElement;

  loading: boolean = true;

  constructor(
    private web3Svc: Web3Service,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.element = this.el.nativeElement;
    this.setAddress(this.address);
    if (this.clickable) this.setClickable();
  }

  ngOnDestroy(): void {}

  setClickable() {
    this.element.style.cursor = 'pointer';

    this.element.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.copyToClipboard();
    });
  }

  async setAddress(address: string): Promise<any> {

    const shortAddress = `${address.slice(0, 5)}...${address.slice(address.length - 5, address.length)}`;
    this.element.innerText = shortAddress;

    if (environment.production) {
      try {
        const ens = await this.web3Svc.getEns(address);
        if (ens) this.element.innerText = ens;
      } catch (err) {
        console.log(err);
      }
    }
  }

  async copyToClipboard() {
    return await navigator.clipboard.writeText(this.address);
  }

}

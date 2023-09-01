import { StateService } from '@/services/state.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TreasuryInfoComponent } from '../treasury-info/treasury-info.component';

import { ThemeService } from '@/services/theme.service';
import { Web3Service } from '@/services/web3.service';

import { firstValueFrom } from 'rxjs';
import { MessagingService } from '@/services/messaging.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    TreasuryInfoComponent
  ],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  constructor(
    public web3Svc: Web3Service,
    public themeSvc: ThemeService,
    public stateSvc: StateService,
    public msgSvc: MessagingService
  ) {}

  ngOnInit(): void {}

  async setMode(): Promise<void> {
    const current = await firstValueFrom(this.themeSvc.theme$);
    const newMode = current === 'dark' ? 'light' : 'dark';
    this.themeSvc.setTheme(newMode);
  }

  connect(): void {
    this.stateSvc.getWeb3Connected() ? this.web3Svc.disconnectWeb3() : this.web3Svc.connect();
  }

}

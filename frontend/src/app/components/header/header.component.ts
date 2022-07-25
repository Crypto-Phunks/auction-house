import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from 'src/app/services/theme.service';

import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  constructor(
    public web3Svc: Web3Service,
    public themeSvc: ThemeService
  ) {}

  ngOnInit(): void {}

  async setMode(): Promise<void> {
    const current = await firstValueFrom(this.themeSvc.theme$);
    const newMode = current === 'dark' ? 'light' : 'dark';
    this.themeSvc.setTheme(newMode);
  }

}

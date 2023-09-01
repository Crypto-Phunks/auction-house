import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateService } from '@/services/state.service';
import { FormatCashPipe } from '@/pipes/format-cash.pipe';

@Component({
  selector: 'app-treasury-info',
  standalone: true,
  imports: [
    CommonModule,

    FormatCashPipe
  ],
  templateUrl: './treasury-info.component.html',
  styleUrls: ['./treasury-info.component.scss']
})
export class TreasuryInfoComponent {

  constructor(
    public stateSvc: StateService
  ) {

  }

}

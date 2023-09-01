import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuctionComponent } from './routes/auction/auction.component';

import { DataGuard } from './guards/data.guard';

const routes: Routes = [
  {
    path: '',
    component: AuctionComponent,
    canActivate: [DataGuard],
    children: [
      {
        path: 'auction/:auctionId',
        component: AuctionComponent,
        canActivate: [DataGuard]
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

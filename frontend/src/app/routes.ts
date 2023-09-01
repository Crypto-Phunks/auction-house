import { Routes } from '@angular/router';

import { DataGuard } from './guards/data.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/auction/auction.component').then(mod => mod.AuctionComponent),
    // component: AuctionComponent,
    canActivate: [DataGuard],
    children: [
      {
        path: 'auction/:auctionId',
        loadComponent: () => import('./routes/auction/auction.component').then(mod => mod.AuctionComponent),
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

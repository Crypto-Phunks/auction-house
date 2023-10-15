import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auction/auction.component').then(mod => mod.AuctionComponent),
    children: [
      {
        path: 'auction/:auctionId',
        loadComponent: () => import('./auction/auction.component').then(mod => mod.AuctionComponent),
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

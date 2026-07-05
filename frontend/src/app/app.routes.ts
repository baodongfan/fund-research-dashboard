import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: '基金研究看板'
  },
  {
    path: 'fund/:code',
    loadComponent: () =>
      import('./pages/fund-detail/fund-detail.component').then(m => m.FundDetailComponent),
  },
  {
    path: '**',
    redirectTo: ''
  }
];

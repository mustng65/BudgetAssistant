import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./common/home/home').then((m) => m.Home) },
  {
    path: 'tithingCalc',
    loadComponent: () => import('./utilities/tithing-calc/tithing-calc').then((m) => m.TithingCalc),
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

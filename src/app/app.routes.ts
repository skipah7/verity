import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((module) => module.HomePage),
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library.page').then((module) => module.LibraryPage),
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', // Ruta inicial
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'login', // Ruta login
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    pathMatch: 'full'
  },
  {
    path: 'signup', // Ruta registro
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    pathMatch: 'full'
  },
  {
    path: 'menu', // Ruta menú principal
    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent),
    pathMatch: 'full'
  },
  {
    path: 'card-search', // Ruta del Buscador de Cartas
    loadComponent: () => import('./pages/card-search/card-search.component').then(m => m.CardSearchComponent),
    pathMatch: 'full'
  },
  {
    path: 'card-details', // Ruta de detalles de una carta
    loadComponent: () => import('./pages/card-details/card-details.component').then(m => m.CardDetailsComponent),
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

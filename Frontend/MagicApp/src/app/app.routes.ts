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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

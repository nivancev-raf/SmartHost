import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  // Add more routes as needed
  { path: '**', redirectTo: '' }
];

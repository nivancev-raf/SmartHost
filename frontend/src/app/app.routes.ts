import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';
import { Profile } from './components/public/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'profile', component: Profile },
  // Add more routes as needed
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';
import { Profile } from './components/public/profile/profile';
import { Contact } from './components/public/contact/contact';
import { About } from './components/public/about/about';
import { BookingHistory } from './components/public/booking-history/booking-history';
import { Apartments as AdminApartments } from './components/admin/apartments/apartments';
import { Apartments as PublicApartments } from './components/public/apartments/apartments';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'profile', component: Profile },
  
  // Public routes
  { path: 'apartments', component: PublicApartments },
  { path: 'contact', component: Contact },
  { path: 'about', component: About },
  { path: 'booking-history', component: BookingHistory },
  
  // Admin routes with guard protection
  { 
    path: 'admin/dashboard', 
    redirectTo: 'admin/apartments', 
    pathMatch: 'full'
  },
  { 
    path: 'admin/apartments', 
    component: AdminApartments,
    canActivate: [AdminGuard]
  },
  
  // Add more routes as needed
  { path: '**', redirectTo: '' }
];

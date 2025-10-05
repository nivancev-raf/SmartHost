import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';
import { Profile } from './components/public/profile/profile';
import { Contact } from './components/public/contact/contact';
import { About } from './components/public/about/about';
import { BookingHistory } from './components/public/booking-history/booking-history';
import { PaymentSuccess } from './components/public/payment-success/payment-success';
import { PaymentCancel } from './components/public/payment-cancel/payment-cancel';
import { Apartments as AdminApartments } from './components/admin/apartments/apartments';
import { Reservations as AdminReservations } from './components/admin/reservations/reservations';
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
  
  // Payment routes - Stripe redirects here after payment
  { path: 'booking-success', component: PaymentSuccess },
  { path: 'booking-cancelled', component: PaymentCancel },
  
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
  { 
    path: 'admin/reservations', 
    component: AdminReservations,
    canActivate: [AdminGuard]
  },
  
  // Add more routes as needed
  { path: '**', redirectTo: '' }
];

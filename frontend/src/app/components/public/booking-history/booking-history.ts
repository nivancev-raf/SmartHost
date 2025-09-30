import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApartmentService } from '../../../services/apartment.service';
import { DialogService } from '../../../services/dialog.service';
import { User } from '../../../models/auth';
import { ReservationResponse, ReservationStatus } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

interface ReservationWithApartment extends ReservationResponse {
  apartment?: Apartment;
}

@Component({
  selector: 'app-booking-history',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './booking-history.html',
  styleUrl: './booking-history.css'
})
export class BookingHistory implements OnInit, OnDestroy {
  heroImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&crop=center';
  currentUser: User | null = null;
  reservations: ReservationWithApartment[] = [];
  isLoading = false;
  isLoggedIn = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status
    const authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      if (this.isLoggedIn && user?.role === 'CLIENT') {
        this.loadClientReservations();
      }
    });
    
    this.subscriptions.push(authSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadClientReservations(): void {
    this.isLoading = true;
    
    const reservationSubscription = this.apartmentService.getClientReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loadApartmentDetails();
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.snackBar.open('Failed to load reservations', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(reservationSubscription);
  }

  private loadApartmentDetails(): void {
    // Load apartment details for each reservation
    const apartmentRequests = this.reservations.map(reservation =>
      this.apartmentService.getApartmentById(reservation.apartmentId).subscribe({
        next: (apartment) => {
          reservation.apartment = apartment;
        },
        error: (error) => {
          console.error(`Error loading apartment ${reservation.apartmentId}:`, error);
        }
      })
    );

    // Wait for all apartment details to load
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  openLoginDialog(): void {
    this.dialogService.openLoginDialog();
  }

  openRegisterDialog(): void {
    this.dialogService.openRegisterDialog();
  }

  getStatusClass(status: ReservationStatus): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: ReservationStatus): string {
    switch (status) {
      case 'CONFIRMED':
        return 'check_circle';
      case 'PENDING':
        return 'schedule';
      case 'CANCELLED':
        return 'cancel';
      case 'COMPLETED':
        return 'done_all';
      default:
        return 'schedule';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  viewApartmentDetails(apartmentId: number): void {
    // Navigate to apartment details or show in dialog
    // For now, navigate to apartments page with query params
    this.router.navigate(['/apartments'], { 
      queryParams: { 
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 1,
        apartmentId: apartmentId
      }
    });
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }
}

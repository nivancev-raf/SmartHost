import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { ReservationUtils } from '../../../utils/reservation.utils';
import { User } from '../../../models/auth';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

// Types
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
  // Public properties
  readonly heroImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&crop=center';
  currentUser: User | null = null;
  reservations: ReservationWithApartment[] = [];
  isLoading = false;
  isLoggedIn = false;
  
  // Private properties
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public reservationUtils: ReservationUtils
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.initializeAuthSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Public methods - Authentication
  openLoginDialog(): void {
    this.dialogService.openLoginDialog();
  }

  openRegisterDialog(): void {
    this.dialogService.openRegisterDialog();
  }

  viewApartmentDetails(apartmentId: number): void {
    const reservation = this.reservations.find(r => r.apartmentId === apartmentId);
    
    if (reservation?.apartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(reservation.apartment, false);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'book') {
          this.onBookApartment(result.apartment);
        }
      });
    } else {
      this.snackBar.open('Apartment details not available', 'Close', { duration: 3000 });
    }
  }

  onBookApartment(apartment: any): void {
    // Open booking dialog for the selected apartment
    this.dialogService.openBookingDialog(apartment);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }

  // Public methods - Statistics (delegated to utility service)
  getActiveReservations(): number {
    return this.reservationUtils.getActiveReservations(this.reservations);
  }

  getCompletedReservations(): number {
    return this.reservationUtils.getCompletedReservations(this.reservations);
  }

  // Public methods - Display Status (delegated to utility service)
  getDisplayStatus(reservation: ReservationResponse) {
    return this.reservationUtils.getDisplayStatus(reservation);
  }

  getDisplayStatusIcon(reservation: ReservationResponse): string {
    return this.reservationUtils.getDisplayStatusIcon(reservation);
  }

  getDisplayStatusClass(reservation: ReservationResponse): string {
    return this.reservationUtils.getDisplayStatusClass(reservation);
  }

  // Public methods - Formatting (delegated to utility service)
  formatDate(dateString: string): string {
    return this.reservationUtils.formatDate(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.reservationUtils.formatDateTime(dateString);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    return this.reservationUtils.calculateNights(checkIn, checkOut);
  }

  // Private methods - Initialization
  private initializeAuthSubscription(): void {
    const authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      if (this.isLoggedIn && user?.role === 'CLIENT') {
        this.loadClientReservations();
      }
    });
    
    this.subscriptions.push(authSubscription);
  }

  // Private methods - Data Loading
  private loadClientReservations(): void {
    if (!this.currentUser?.id) {
      this.handleError('User information not available', 'No user found or user ID missing');
      return;
    }

    this.isLoading = true;
    
    const reservationSubscription = this.apartmentService.getClientReservations(this.currentUser.id).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.sortReservations();
        this.loadApartmentDetails();
      },
      error: (error) => {
        this.handleError('Failed to load reservations', 'Error loading reservations', error);
      }
    });
    
    this.subscriptions.push(reservationSubscription);
  }

  private loadApartmentDetails(): void {
    if (this.reservations.length === 0) {
      this.finishLoading();
      return;
    }

    let loadedCount = 0;
    const totalCount = this.reservations.length;

    this.reservations.forEach(reservation => {
      const apartmentSubscription = this.apartmentService.getApartmentById(reservation.apartmentId).subscribe({
        next: (apartment) => {
          reservation.apartment = apartment;
          this.checkAllApartmentsLoaded(++loadedCount, totalCount);
        },
        error: (error) => {
          console.error(`Error loading apartment ${reservation.apartmentId}:`, error);
          this.checkAllApartmentsLoaded(++loadedCount, totalCount);
        }
      });
      
      this.subscriptions.push(apartmentSubscription);
    });
  }

  // Private methods - Sorting (delegated to utility service)
  private sortReservations(): void {
    this.reservations = this.reservationUtils.sortReservations(this.reservations);
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private checkAllApartmentsLoaded(loadedCount: number, totalCount: number): void {
    if (loadedCount === totalCount) {
      this.finishLoading();
    }
  }

  private handleError(userMessage: string, logMessage: string, error?: any): void {
    console.error(logMessage, error);
    this.snackBar.open(userMessage, 'Close', { duration: 3000 });
    this.finishLoading();
  }
}

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
import { User } from '../../../models/auth';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

// Types
interface ReservationWithApartment extends ReservationResponse {
  apartment?: Apartment;
}

type ReservationDisplayStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

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
    private cdr: ChangeDetectorRef
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

  // Public methods - Statistics
  getActiveReservations(): number {
    return this.reservations.filter(r => this.getDisplayStatus(r) !== 'ACTIVE').length;
  }

  getCompletedReservations(): number {
    return this.reservations.filter(r => this.getDisplayStatus(r) === 'COMPLETED').length;
  }

  // Public methods - Display Status
  getDisplayStatus(reservation: ReservationResponse): ReservationDisplayStatus {
    const today = this.getTodayDate();
    const checkInDate = this.getDateOnly(reservation.checkIn);
    const checkOutDate = this.getDateOnly(reservation.checkOut);
    
    if (checkOutDate < today) {
      return 'COMPLETED';
    } else if (checkInDate <= today && checkOutDate >= today) {
      return 'ACTIVE';
    } else {
      return 'UPCOMING';
    }
  }

  getDisplayStatusIcon(reservation: ReservationResponse): string {
    const statusIcons: Record<ReservationDisplayStatus, string> = {
      'COMPLETED': 'done_all',
      'ACTIVE': 'hotel',
      'UPCOMING': 'schedule'
    };
    return statusIcons[this.getDisplayStatus(reservation)];
  }

  getDisplayStatusClass(reservation: ReservationResponse): string {
    return `status-${this.getDisplayStatus(reservation).toLowerCase()}`;
  }

  // Public methods - Formatting
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

  // Private methods - Sorting
  private sortReservations(): void {
    this.reservations.sort((a, b) => {
      const aOrder = this.getReservationSortOrder(a);
      const bOrder = this.getReservationSortOrder(b);
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Within same status, sort by check-in date
      const aCheckIn = new Date(a.checkIn);
      const bCheckIn = new Date(b.checkIn);
      
      // For completed: most recent first, for others: earliest first
      return aOrder === 3 ? bCheckIn.getTime() - aCheckIn.getTime() : aCheckIn.getTime() - bCheckIn.getTime();
    });
  }

  private getReservationSortOrder(reservation: ReservationResponse): number {
    const statusOrder: Record<ReservationDisplayStatus, number> = {
      'UPCOMING': 1,
      'ACTIVE': 2,
      'COMPLETED': 3
    };
    return statusOrder[this.getDisplayStatus(reservation)] || 4;
  }

  // Private methods - Utilities
  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getDateOnly(dateString: string): Date {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
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

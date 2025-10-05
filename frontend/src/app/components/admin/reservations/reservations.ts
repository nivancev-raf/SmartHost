import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
// MatChipsModule already imported above
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApartmentService } from '../../../services/apartment.service';
import { ReservationUtils } from '../../../utils/reservation.utils';
import { User } from '../../../models/auth';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

interface ReservationWithApartment extends ReservationResponse {
  apartment?: Apartment;
}

@Component({
  selector: 'app-reservations',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations implements OnInit, OnDestroy {
  // Public properties
  currentUser: User | null = null;
  reservations: ReservationWithApartment[] = [];
  isLoading = false;
  
  // Filter properties
  ownerApartments: Apartment[] = [];
  selectedApartmentFilter: number | string | null = null;
  selectedStatusFilter: string | null = null;
  filteredReservations: ReservationWithApartment[] = [];
  
  // Table configuration
  displayedColumns: string[] = ['apartment', 'guest', 'dates', 'status', 'price', 'actions'];
  
  // Private properties
  private subscriptions: Subscription[] = [];
  
  // Utility service instance
  public reservationUtils = new ReservationUtils();

  constructor(
    private authService: AuthService,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    // Initialize filters
    this.selectedApartmentFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.filteredReservations = [];
    
    this.initializeAuthSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    return this.reservationUtils.formatDateShort(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.reservationUtils.formatDateTime(dateString);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    return this.reservationUtils.calculateNights(checkIn, checkOut);
  }

  // Public methods - Statistics (delegated to utility service)
  getTotalReservations(): number {
    return this.reservations.length;
  }

  getActiveReservations(): number {
    return this.reservationUtils.getActiveReservations(this.reservations);
  }

  getCompletedReservations(): number {
    return this.reservationUtils.getCompletedReservations(this.reservations);
  }

  getTotalRevenue(): number {
    return this.reservationUtils.getTotalRevenue(this.reservations);
  }

  // Private methods - Initialization
  private initializeAuthSubscription(): void {
    const authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user?.role === 'ADMIN' && user.id) {
        this.loadOwnerReservations();
      }
    });
    
    this.subscriptions.push(authSubscription);
  }

  // Private methods - Data Loading
  private loadOwnerReservations(): void {
    if (!this.currentUser?.id) {
      this.handleError('User information not available', 'No user found or user ID missing');
      return;
    }

    this.isLoading = true;
    
    // Load both reservations and apartments
    this.loadOwnerApartments();
    
    const reservationSubscription = this.apartmentService.getOwnerReservations(this.currentUser.id).subscribe({
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
      this.applyFilters();
      this.finishLoading();
    }
  }

  private loadOwnerApartments(): void {
    if (!this.currentUser?.id) return;

    const apartmentSubscription = this.apartmentService.getApartmentsByOwner(this.currentUser.id).subscribe({
      next: (apartments: Apartment[]) => {
        this.ownerApartments = apartments;
      },
      error: (error: any) => {
        console.error('Error loading owner apartments:', error);
      }
    });

    this.subscriptions.push(apartmentSubscription);
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.reservations];

    // Filter by apartment
    if (this.selectedApartmentFilter && this.selectedApartmentFilter !== 'all') {
      const apartmentId = typeof this.selectedApartmentFilter === 'string' 
        ? parseInt(this.selectedApartmentFilter, 10) 
        : this.selectedApartmentFilter;
      filtered = filtered.filter(reservation => 
        reservation.apartmentId === apartmentId
      );
    }

    // Filter by status
    if (this.selectedStatusFilter && this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(reservation => {
        const status = this.reservationUtils.getDisplayStatus(reservation);
        return status === this.selectedStatusFilter;
      });
    }

    this.filteredReservations = filtered;
  }

  clearFilters(): void {
    this.selectedApartmentFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.applyFilters();
  }

  clearApartmentFilter(): void {
    this.selectedApartmentFilter = 'all';
    this.applyFilters();
  }

  clearStatusFilter(): void {
    this.selectedStatusFilter = 'all';
    this.applyFilters();
  }

  getDisplayReservations(): ReservationWithApartment[] {
    return this.filteredReservations;
  }

  getApartmentName(apartmentId: number | string | null): string {
    if (!apartmentId || apartmentId === 'all') {
      return 'All Apartments';
    }
    
    const id = typeof apartmentId === 'string' ? parseInt(apartmentId, 10) : apartmentId;
    const apartment = this.ownerApartments.find(apt => apt.id === id);
    return apartment?.name || 'Unknown Apartment';
  }

  private handleError(userMessage: string, logMessage: string, error?: any): void {
    console.error(logMessage, error);
    this.snackBar.open(userMessage, 'Close', { duration: 3000 });
    this.finishLoading();
  }
}

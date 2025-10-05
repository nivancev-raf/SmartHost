import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApartmentService } from '../../../services/apartment.service';
import { User } from '../../../models/auth';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment, ApartmentCardData } from '../../../models/apartment';
import { CalendarDialogComponent } from './calendar-dialog/calendar-dialog.component';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';


@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatChipsModule,
    ApartmentCardComponent
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit, OnDestroy {
  // Public properties
  currentUser: User | null = null;
  isLoading = false;
  apartments: Apartment[] = [];
  reservations: ReservationResponse[] = [];

  // Private properties
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.initializeAuthSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Private methods - Auth and Data Loading
  private initializeAuthSubscription(): void {
    const authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user?.role === 'ADMIN' && user.id) {
        this.loadCalendarData();
      }
    });
    
    this.subscriptions.push(authSubscription);
  }

  private loadCalendarData(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;
    this.loadApartments();
    this.loadReservations();
  }

  private loadApartments(): void {
    if (!this.currentUser?.id) return;

    const apartmentSubscription = this.apartmentService.getApartmentsByOwner(this.currentUser.id).subscribe({
      next: (apartments: Apartment[]) => {
        this.apartments = apartments;
        this.checkDataLoaded();
      },
      error: (error: any) => {
        this.handleError('Failed to load apartments', 'Error loading apartments', error);
      }
    });

    this.subscriptions.push(apartmentSubscription);
  }

  private loadReservations(): void {
    if (!this.currentUser?.id) return;

    const reservationSubscription = this.apartmentService.getOwnerReservations(this.currentUser.id).subscribe({
      next: (reservations: ReservationResponse[]) => {
        this.reservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING');
        this.checkDataLoaded();
      },
      error: (error: any) => {
        this.handleError('Failed to load reservations', 'Error loading reservations', error);
      }
    });

    this.subscriptions.push(reservationSubscription);
  }

  private checkDataLoaded(): void {
    if (this.apartments.length >= 0) { // Allow for empty arrays
      this.finishLoading();
    }
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private handleError(userMessage: string, logMessage: string, error?: any): void {
    console.error(logMessage, error);
    this.snackBar.open(userMessage, 'Close', { duration: 3000 });
    this.finishLoading();
  }

  convertToCardData(apartment: Apartment): ApartmentCardData {
    const primaryImage = apartment.images?.find(img => img.featured) || apartment.images?.[0];
    const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop';
    return {
      id: apartment.id,
      name: apartment.name,
      location: apartment.city,
      guests: apartment.maxGuests || 0,
      price: apartment.basePrice || 0,
      currency: apartment.currency || '€',
      rating: apartment.rating || 4.5,
      imageUrl: imageUrl,
      amenities: apartment.amenities || [],
      description: apartment.description
    };
  }

  onViewCalendar(apartmentCardData: ApartmentCardData): void {
    const apartment = this.apartments.find(apt => apt.id === apartmentCardData.id);
    if (apartment) {
      this.openCalendarDialog(apartment);
    }
  }

  openCalendarDialog(apartment: Apartment): void {
    const apartmentReservations = this.reservations.filter(r => r.apartmentId === apartment.id);
    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      width: '90vw',
      maxWidth: '1000px',
      height: '60vh',
      data: {
        apartment: apartment,
        reservations: apartmentReservations
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Handle any actions after dialog closes if needed
    });
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

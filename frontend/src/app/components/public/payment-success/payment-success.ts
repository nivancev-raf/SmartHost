import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApartmentService } from '../../../services/apartment.service';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

@Component({
  selector: 'app-payment-success',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css'
})
export class PaymentSuccess implements OnInit {
  sessionId: string | null = null;
  reservationId: string | null = null;
  isLoading = true;
  reservation: ReservationResponse | null = null;
  apartment: Apartment | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private apartmentService: ApartmentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      this.reservationId = params['reservation_id'];

      console.log("Reservation ID:", this.reservationId);
      console.log("Session ID:", this.sessionId);

      if (!this.sessionId) {
        console.error('No session ID found in URL');
        this.isLoading = false;
        return;
      }
      
      // Fetch reservation details if reservationId is available
      if (this.reservationId) {
        this.fetchReservationDetails(parseInt(this.reservationId));
      } else {
        // Try to extract reservation ID from session ID or other params
        // For now, just show basic success message
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 1500);
      }
    });
  }

  goToBookingHistory(): void {
    this.router.navigate(['/booking-history']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }

  private fetchReservationDetails(reservationId: number): void {
    this.apartmentService.getReservationById(reservationId).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        console.log('Reservation details:', reservation);
        
        // Fetch apartment details
        this.apartmentService.getApartmentById(reservation.apartmentId).subscribe({
          next: (apartment) => {
            this.apartment = apartment;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error fetching apartment details:', error);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error fetching reservation details:', error);
        this.error = 'Unable to load reservation details';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

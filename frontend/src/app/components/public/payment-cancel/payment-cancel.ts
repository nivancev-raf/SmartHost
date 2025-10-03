import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApartmentService } from '../../../services/apartment.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-payment-cancel',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-cancel.html',
  styleUrl: './payment-cancel.css'
})
export class PaymentCancel implements OnInit {
  reservationId: string | null = null;
  deletionError = false;
  token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Use snapshot instead of subscribe to avoid multiple emissions
    const params = this.route.snapshot.queryParams;
    this.token = params['token'];
    this.reservationId = params['reservation_id'];
    
    if (this.reservationId && this.token) {
      this.deleteReservation(parseInt(this.reservationId), this.token);
    }
  }

  private deleteReservation(reservationId: number, token: string): void {
    this.apartmentService.deleteReservation(reservationId, token).subscribe({
      next: () => {
        console.log(`Reservation ${reservationId} deleted successfully`);
        this.snackBar.open('Reservation cancelled and removed', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Failed to delete reservation:', error);
        this.deletionError = true;
        this.snackBar.open('Reservation cleanup failed, but you can continue booking', 'Close', { 
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
      }
    });
  }

  startNewBooking(): void {
    this.router.navigate(['/apartments']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }
}

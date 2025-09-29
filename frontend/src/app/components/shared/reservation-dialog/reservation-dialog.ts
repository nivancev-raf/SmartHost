import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apartment } from '../../../models/apartment';
import { ReservationRequest, ReservationResponse } from '../../../models/reservation';
import { ApartmentService } from '../../../services/apartment.service';
import { AuthService } from '../../../services/auth.service';

export interface ReservationDialogData {
  apartment: Apartment;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface ReservationDialogResult {
  success: boolean;
  reservation?: ReservationResponse;
  error?: string;
}

@Component({
  selector: 'app-reservation-dialog',
  templateUrl: './reservation-dialog.html',
  styleUrls: ['./reservation-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ]
})
export class ReservationDialogComponent implements OnInit {
  reservationForm: FormGroup;
  apartment: Apartment;
  checkIn: string;
  checkOut: string;
  guests: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private apartmentService: ApartmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReservationDialogData
  ) {
    this.apartment = data.apartment;
    this.checkIn = data.checkIn;
    this.checkOut = data.checkOut;
    this.guests = data.guests;
    this.reservationForm = this.createReservationForm();
  }

  ngOnInit(): void {
    // Populate form with user data if logged in
    this.populateUserData();
  }

  private populateUserData(): void {
    if (this.isLoggedIn) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.reservationForm.patchValue({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });
      }
    }
  }

  private createReservationForm(): FormGroup {
    const isLoggedIn = !!this.authService.getToken();
    
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      // Address fields are required for guest reservations, optional for client reservations
      address: ['', isLoggedIn ? [] : [Validators.required]],
      city: ['', isLoggedIn ? [] : [Validators.required]],
      country: ['', isLoggedIn ? [] : [Validators.required]],
      specialRequests: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmitReservation(): void {
    if (this.reservationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.reservationForm.value;
      const isLoggedIn = !!this.authService.getToken();
      
      const reservationRequest: ReservationRequest = {
        apartmentId: this.apartment.id,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests,
        totalPrice: this.totalPrice,
        specialRequest: formValue.specialRequests || undefined,
        guestInformation: {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          address: formValue.address || undefined,
          city: formValue.city || undefined,
          country: formValue.country || undefined
        }
      };

      // Choose the appropriate service method based on login status
      const reservationObservable = isLoggedIn 
        ? this.apartmentService.createClientReservation(reservationRequest)
        : this.apartmentService.createGuestReservation(reservationRequest);

      reservationObservable.subscribe({
        next: (reservation: ReservationResponse) => {
          this.isSubmitting = false;
          this.snackBar.open(
            `Reservation created successfully! Access code: ${reservation.accessCode}`, 
            'Close', 
            { duration: 10000 }
          );
          
          this.dialogRef.close({
            success: true,
            reservation: reservation
          } as ReservationDialogResult);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Reservation error:', error);
          
          const errorMessage = error.error?.message || error.message || 'Failed to create reservation. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          
          this.dialogRef.close({
            success: false,
            error: errorMessage
          } as ReservationDialogResult);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.reservationForm.controls).forEach(key => {
        this.reservationForm.get(key)?.markAsTouched();
      });
    }
  }

  // Helper methods for form validation
  getErrorMessage(fieldName: string): string {
    const control = this.reservationForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    
    if (control?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.reservationForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  // Calculate number of nights
  get numberOfNights(): number {
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Calculate total price
  get totalPrice(): number {
    return this.numberOfNights * (this.apartment.basePrice || 0);
  }

  // Format dates for display
  get checkInFormatted(): string {
    return new Date(this.checkIn).toLocaleDateString();
  }

  get checkOutFormatted(): string {
    return new Date(this.checkOut).toLocaleDateString();
  }

  get isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }
  }

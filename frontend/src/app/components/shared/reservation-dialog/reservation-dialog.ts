import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Apartment } from '../../../models/apartment';

export interface ReservationDialogData {
  apartment: Apartment;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface ReservationDialogResult {
  guestData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  termsAccepted: boolean;
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
    MatIconModule,
    MatCheckboxModule
  ]
})
export class ReservationDialogComponent implements OnInit {
  reservationForm: FormGroup;
  apartment: Apartment;
  checkIn: string;
  checkOut: string;
  guests: number;

  constructor(
    private fb: FormBuilder,
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
    // Initialize form if needed
  }

  private createReservationForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      specialRequests: [''],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmitReservation(): void {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const reservationData: ReservationDialogResult = {
        guestData: {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          specialRequests: formValue.specialRequests
        },
        termsAccepted: formValue.termsAccepted
      };

      this.dialogRef.close(reservationData);
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
}

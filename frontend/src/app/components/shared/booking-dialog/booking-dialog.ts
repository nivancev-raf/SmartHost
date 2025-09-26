import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { Apartment } from '../../../models/apartment';

export interface BookingDialogData {
  apartment: Apartment;
}

export interface BookingDialogResult {
  checkIn: string;
  checkOut: string;
  guests: number;
}

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.html',
  styleUrls: ['./booking-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatNativeDateModule
  ]
})
export class BookingDialogComponent implements OnInit {
  bookingForm: FormGroup;
  minDate = new Date();
  apartment: Apartment;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingDialogData
  ) {
    this.apartment = data.apartment;
    this.bookingForm = this.createBookingForm();
  }

  ngOnInit(): void {
    // Set min checkout date when checkin changes
    this.bookingForm.get('checkIn')?.valueChanges.subscribe(checkInDate => {
      if (checkInDate) {
        const minCheckOut = new Date(checkInDate);
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        const currentCheckOut = this.bookingForm.get('checkOut')?.value;
        
        // Only update checkout if it's not set or if it's before the minimum date
        if (!currentCheckOut || currentCheckOut <= checkInDate) {
          this.bookingForm.get('checkOut')?.setValue(minCheckOut);
        }
      }
    });
  }

  private createBookingForm(): FormGroup {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Set default guests: 1 if maxGuests is 1, otherwise 2
    const defaultGuests = this.apartment.maxGuests === 1 ? 1 : 2;

    return this.fb.group({
      checkIn: [tomorrow, Validators.required],
      checkOut: [dayAfterTomorrow, Validators.required],
      guests: [defaultGuests, [Validators.required, Validators.min(1), Validators.max(this.apartment.maxGuests || 8)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCheckAvailability(): void {
    if (this.bookingForm.valid) {
      const formValue = this.bookingForm.value;
      const searchData: BookingDialogResult = {
        checkIn: formValue.checkIn.toISOString().split('T')[0],
        checkOut: formValue.checkOut.toISOString().split('T')[0],
        guests: formValue.guests
      };

      // Close the dialog and navigate to apartments page with search parameters
      this.dialogRef.close(searchData);
      
      // Navigate to apartments page with query parameters
      this.router.navigate(['/apartments'], {
        queryParams: {
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          guests: searchData.guests
        }
      });
    }
  }

  get guestOptions(): number[] {
    const maxGuests = this.apartment.maxGuests || 8;
    return Array.from({ length: maxGuests }, (_, i) => i + 1);
  }

  get minCheckOutDate(): Date {
    const checkInDate = this.bookingForm.get('checkIn')?.value;
    if (checkInDate) {
      const minDate = new Date(checkInDate);
      minDate.setDate(minDate.getDate() + 1);
      return minDate;
    }
    return this.minDate;
  }

  // Calculate number of nights
  get numberOfNights(): number {
    const checkIn = this.bookingForm.get('checkIn')?.value;
    const checkOut = this.bookingForm.get('checkOut')?.value;
    
    if (checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    return 1;
  }

  // Calculate total price
  get totalPrice(): number {
    return this.numberOfNights * (this.apartment.basePrice || 0);
  }
}

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.html',
  styleUrls: ['./search-form.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule
  ]
})
export class SearchFormComponent implements OnInit {
  @Output() searchSubmit = new EventEmitter<any>();

  searchForm: FormGroup;
  minDate = new Date();

  constructor(private fb: FormBuilder) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    // Set min checkout date when checkin changes
    this.searchForm.get('checkIn')?.valueChanges.subscribe(checkInDate => {
      if (checkInDate) {
        const minCheckOut = new Date(checkInDate);
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        this.searchForm.get('checkOut')?.setValue(minCheckOut);
      }
    });
  }

  private createSearchForm(): FormGroup {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return this.fb.group({
      checkIn: [tomorrow, Validators.required],
      checkOut: [dayAfterTomorrow, Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;
      const searchData = {
        checkIn: formValue.checkIn.toISOString().split('T')[0],
        checkOut: formValue.checkOut.toISOString().split('T')[0],
        guests: formValue.guests
      };
      this.searchSubmit.emit(searchData);
    }
  }

  get guestOptions(): number[] {
    return Array.from({ length: 8 }, (_, i) => i + 1);
  }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApartmentCardData } from '../../../models/apartment';

@Component({
  selector: 'app-apartment-card-wide',
  templateUrl: './apartment-card-wide.html',
  styleUrls: ['./apartment-card-wide.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class ApartmentCardWideComponent {
  @Input() apartment!: ApartmentCardData;
  @Input() showBookButton = true;
  
  @Output() onView = new EventEmitter<ApartmentCardData>();
  @Output() onBook = new EventEmitter<ApartmentCardData>();

  onViewClick(): void {
    this.onView.emit(this.apartment);
  }

  onBookClick(): void {
    this.onBook.emit(this.apartment);
  }

  getStarArray(): boolean[] {
    const stars = [];
    const rating = Math.floor(this.apartment.rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }
}

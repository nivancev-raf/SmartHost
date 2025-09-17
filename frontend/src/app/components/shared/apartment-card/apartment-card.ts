import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface Apartment {
  id: number;
  name: string;
  location: string;
  rating: number;
  guests: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  description?: string;
}

@Component({
  selector: 'app-apartment-card',
  templateUrl: './apartment-card.html',
  styleUrls: ['./apartment-card.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class ApartmentCardComponent {
  @Input() apartment!: Apartment;
  @Input() showAdminActions = false;
  
  @Output() onEdit = new EventEmitter<Apartment>();
  @Output() onDelete = new EventEmitter<Apartment>();
  @Output() onView = new EventEmitter<Apartment>();

  onEditClick(): void {
    this.onEdit.emit(this.apartment);
  }

  onDeleteClick(): void {
    this.onDelete.emit(this.apartment);
  }

  onViewClick(): void {
    this.onView.emit(this.apartment);
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

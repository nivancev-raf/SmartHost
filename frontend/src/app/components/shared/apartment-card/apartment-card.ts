import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApartmentCardData } from '../../../models/apartment';

@Component({
  selector: 'app-apartment-card',
  standalone: true,
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
  @Input() apartment!: ApartmentCardData; // apartment! data is required
  @Input() showAdminActions = false;
  @Input() viewButtonText = 'Details'; // Customizable button text
  
  @Output() onEdit = new EventEmitter<ApartmentCardData>();
  @Output() onDelete = new EventEmitter<ApartmentCardData>();
  @Output() onView = new EventEmitter<ApartmentCardData>();

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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Fallback to a default placeholder image
    img.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop';
  }
}

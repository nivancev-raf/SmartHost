import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApartmentCardData } from '../../../models/apartment';

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
  @Input() apartment!: ApartmentCardData; // apartment! data is required
  @Input() showAdminActions = false;
  
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
}

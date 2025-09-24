import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Apartment } from '../../../models/apartment';
import { AuthService } from '../../../services/auth.service';

export interface ApartmentDetailsDialogData {
  apartment: Apartment;
  isAdminView?: boolean;
}

@Component({
  selector: 'app-apartment-details-dialog',
  templateUrl: './apartment-details-dialog.html',
  styleUrls: ['./apartment-details-dialog.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule
  ]
})
export class ApartmentDetailsDialog implements OnInit {
  apartment: Apartment;
  isAdminView: boolean = false;
  currentImageIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ApartmentDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ApartmentDetailsDialogData,
    private authService: AuthService
  ) {
    this.apartment = data.apartment;
    this.isAdminView = data.isAdminView || this.authService.isAdmin();
  }

  ngOnInit(): void {
    // Ensure we have at least one image
    if (!this.apartment.images || this.apartment.images.length === 0) {
      this.apartment.images = [{
        id: 0,
        apartmentId: this.apartment.id,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        featured: true,
        createdAt: new Date().toISOString()
      }];
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onBook(): void {
    this.dialogRef.close({ action: 'book', apartment: this.apartment });
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', apartment: this.apartment });
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete', apartment: this.apartment });
  }

  // Image navigation
  nextImage(): void {
    if (this.apartment.images && this.apartment.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.apartment.images.length;
    }
  }

  previousImage(): void {
    if (this.apartment.images && this.apartment.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.apartment.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  setImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Get current image URL
  get currentImageUrl(): string {
    return this.apartment.images?.[this.currentImageIndex]?.url || '';
  }

  // Check if multiple images exist
  get hasMultipleImages(): boolean {
    return this.apartment.images ? this.apartment.images.length > 1 : false;
  }

  // Get status color
  getStatusColor(): string {
    switch (this.apartment.status) {
      case 'AVAILABLE':
        return '#4caf50';
      case 'CLEANING':
        return '#ff9800';
      case 'BOOKED':
        return '#f44336';
      default:
        return '#757575';
    }
  }

  // Format status text
  getStatusText(): string {
    switch (this.apartment.status) {
      case 'AVAILABLE':
        return 'Available';
      case 'BOOKED':
        return 'Booked';
      case 'CLEANING':
        return 'Under Cleaning';
      default:
        return 'Unknown';
    }
  }

  // Calculate rating stars
  getStarArray(): boolean[] {
    const stars = [];
    const rating = Math.floor(this.apartment.rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  // Format price
  get formattedPrice(): string {
    return `${this.apartment.currency || '€'}${this.apartment.basePrice}`;
  }
}

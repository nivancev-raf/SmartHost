import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Review } from '../../../models/review';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth';

@Component({
  selector: 'app-review-list',
  standalone: true,
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ]
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: Review[] = [];
  @Input() loading = false;
  @Input() showActions = false; // Show edit/delete buttons for admins or review owners
  @Input() emptyMessage = 'No reviews found';
  
  @Output() editReview = new EventEmitter<Review>();
  @Output() deleteReview = new EventEmitter<Review>();

  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  // Generate star rating array
  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  // Check if current user can edit/delete this review
  canModifyReview(review: Review): boolean {
    if (!this.currentUser || !this.showActions) return false;
    
    // Admin can modify any review, or user can modify their own review
    return this.currentUser.role === 'ADMIN' || this.currentUser.id === review.clientId;
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get reviewer display name
  getReviewerName(review: Review): string {
    if (review.client) {
      return `${review.client.firstName} ${review.client.lastName}`;
    }
    return 'Anonymous User';
  }

  // Get apartment display name
  getApartmentName(review: Review): string {
    return review.apartment?.name || `Apartment #${review.apartmentId}`;
  }

  onEditClick(review: Review): void {
    this.editReview.emit(review);
  }

  onDeleteClick(review: Review): void {
    this.deleteReview.emit(review);
  }
}
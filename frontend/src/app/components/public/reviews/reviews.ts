import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';

import { Review } from '../../../models/review';
import { User } from '../../../models/auth';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { ReviewListComponent } from '../../shared/review-list/review-list.component';
import { PendingReviewsComponent } from '../../shared/pending-reviews/pending-reviews.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    ReviewListComponent,
    PendingReviewsComponent
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class Reviews implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  heroImage = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&crop=center';
  currentUser: User | null = null;
  allReviews: Review[] = [];
  myReviews: Review[] = [];
  pendingReviewsCount = 0;
  loadingAllReviews = false;
  loadingMyReviews = false;
  selectedTabIndex = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Load all reviews (public access)
    this.loadAllReviews();
    
    // Load user's reviews if logged in as client
    if (this.currentUser && this.currentUser.role === 'CLIENT') {
      this.loadMyReviews();
      this.loadPendingReviewsCount();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllReviews(): void {
    this.loadingAllReviews = true;
    
    // For now, we'll load all reviews from all apartments
    // In a real implementation, you might want to load reviews for specific apartments
    // or implement a general endpoint for all reviews
    this.reviewService.getAllReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reviews) => {
          this.allReviews = reviews;
          this.loadingAllReviews = false;
        },
        error: (error) => {
          console.error('Error loading reviews:', error);
          this.loadingAllReviews = false;
          // Don't show error for public access - just show empty state
          this.allReviews = [];
        }
      });
  }

  loadMyReviews(): void {
    this.loadingMyReviews = true;
    
    this.reviewService.getMyReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reviews) => {
          this.myReviews = reviews;
          this.loadingMyReviews = false;
        },
        error: (error) => {
          console.error('Error loading my reviews:', error);
          this.loadingMyReviews = false;
          this.snackBar.open('Error loading your reviews', 'Close', { duration: 3000 });
        }
      });
  }

  loadPendingReviewsCount(): void {
    this.reviewService.getPendingReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pendingReviews) => {
          this.pendingReviewsCount = pendingReviews.length;
        },
        error: (error) => {
          console.error('Error loading pending reviews count:', error);
          this.pendingReviewsCount = 0;
        }
      });
  }

  onEditReview(review: Review): void {
    // TODO: Implement edit review dialog
    console.log('Edit review:', review);
    this.snackBar.open('Edit functionality coming soon!', 'Close', { duration: 3000 });
  }

  onDeleteReview(review: Review): void {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.reviewService.deleteReview(review.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
            
            // Remove from local arrays
            this.allReviews = this.allReviews.filter(r => r.id !== review.id);
            this.myReviews = this.myReviews.filter(r => r.id !== review.id);
          },
          error: (error) => {
            console.error('Error deleting review:', error);
            this.snackBar.open('Error deleting review', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  onReviewSubmitted(): void {
    // Refresh pending reviews count
    this.loadPendingReviewsCount();
    // Refresh all reviews to show the new review
    this.loadAllReviews();
    // Refresh my reviews if user is client
    if (this.currentUser?.role === 'CLIENT') {
      this.loadMyReviews();
    }
  }

  // Check if user is logged in as client
  isClient(): boolean {
    return this.currentUser?.role === 'CLIENT';
  }

  // Check if user is logged in as admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  // Navigate to Submit Reviews tab
  goToSubmitReviewsTab(): void {
    this.selectedTabIndex = 1; // Index 1 is the Submit Reviews tab for clients
  }

  // Check if notification should be shown
  shouldShowPendingNotification(): boolean {
    return this.isClient() && this.pendingReviewsCount > 0 && this.selectedTabIndex !== 1;
  }
}

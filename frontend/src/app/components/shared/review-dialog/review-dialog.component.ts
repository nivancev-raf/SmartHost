import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PendingReviewReservation, CreateReviewRequest } from '../../../models/review';
import { ReviewService } from '../../../services/review.service';

export interface ReviewDialogData {
  reservation: PendingReviewReservation;
}

export interface ReviewDialogResult {
  success: boolean;
  reviewId?: number;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class ReviewDialogComponent implements OnInit {
  reviewForm: FormGroup;
  submittingReview = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.createReviewForm();
  }

  ngOnInit(): void {
    // Form is already created in constructor
  }

  createReviewForm(): FormGroup {
    return this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });
  }

  // Generate star rating array for display
  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  // Set rating from star click
  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) return;

    this.submittingReview = true;
    const formValue = this.reviewForm.value;

    const reviewRequest: CreateReviewRequest = {
      reservationId: this.data.reservation.id,
      apartmentId: this.data.reservation.apartmentId,
      rating: formValue.rating,
      comment: formValue.comment?.trim() || undefined
    };

    this.reviewService.createReview(reviewRequest).subscribe({
      next: (review) => {
        this.submittingReview = false;
        this.snackBar.open('Review submitted successfully!', 'Close', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.dialogRef.close({ success: true, reviewId: review.id });
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.submittingReview = false;
        this.snackBar.open('Error submitting review. Please try again.', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
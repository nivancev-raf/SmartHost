import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PendingReviewReservation, CreateReviewRequest } from '../../../models/review';
import { ReviewService } from '../../../services/review.service';
import { ReviewDialogComponent, ReviewDialogData } from '../review-dialog/review-dialog.component';

@Component({
  selector: 'app-pending-reviews',
  standalone: true,
  templateUrl: './pending-reviews.component.html',
  styleUrls: ['./pending-reviews.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class PendingReviewsComponent implements OnInit {
  @Output() reviewSubmitted = new EventEmitter<void>();
  
  pendingReviews: PendingReviewReservation[] = [];
  loading = false;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.loading = true;
    this.reviewService.getPendingReviews().subscribe({
      next: (reviews) => {
        this.pendingReviews = reviews.filter(r => !r.reviewSubmitted);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending reviews:', error);
        this.loading = false;
        this.snackBar.open('Error loading pending reviews', 'Close', { duration: 3000 });
      }
    });
  }

  openReviewDialog(reservation: PendingReviewReservation): void {
    const dialogData: ReviewDialogData = {
      reservation: reservation
    };

    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'review-dialog',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Remove the reviewed reservation from pending list
        this.pendingReviews = this.pendingReviews.filter(
          r => r.id !== reservation.id
        );
        // Emit event to parent component
        this.reviewSubmitted.emit();
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
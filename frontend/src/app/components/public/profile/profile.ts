import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth';
import { ProfileEditDialog } from './profile-edit-dialog';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  heroImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&crop=center';
  currentUser: User | null = null;
  isLoading = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserData(): void {
    this.isLoading = true;
    
    // Subscribe to current user changes
    const userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoading = false;
      
      // Redirect to login if not authenticated
      if (!user) {
        this.router.navigate(['/auth/login']);
      }
    });
    
    this.subscriptions.push(userSubscription);
  }

  openEditDialog(): void {
    if (!this.currentUser) return;

    const dialogRef = this.dialog.open(ProfileEditDialog, {
      width: '600px',
      maxWidth: '90vw',
      data: { user: this.currentUser },
      disableClose: false,
      panelClass: 'profile-edit-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Profile was updated
        this.currentUser = result;
        console.log('Profile updated:', result);
      }
    });
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'CLIENT':
        return 'Client';
      default:
        return 'Guest';
    }
  }

  formatJoinDate(): string {
    if (!this.currentUser?.created_at) return 'Unknown';
    
    try {
      // Parse the LocalDateTime ISO string from backend
      const joinDate = new Date(this.currentUser.created_at);
      
      // Check if date is valid
      if (isNaN(joinDate.getTime())) {
        return 'Unknown';
      }
      
      return joinDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error parsing join date:', error);
      return 'Unknown';
    }
  }
}

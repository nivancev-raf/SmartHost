import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';
import { Apartment, ApartmentCardData, ApartmentStatus } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-apartments',
  imports: [CommonModule, ApartmentCardComponent, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css'
})
export class Apartments implements OnInit, OnDestroy {
  apartments: ApartmentCardData[] = [];
  allApartments: Apartment[] = []; // Store full apartment data
  adminName: string = '';
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(
    private apartmentService: ApartmentService, 
    private authService: AuthService, 
    private router: Router,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
    // Use setTimeout to ensure the view is initialized
    setTimeout(() => {
      this.loadApartments();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAdminData(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.adminName = user.firstName ? `${user.firstName} ${user.lastName}` : user.email;
          this.cdr.detectChanges(); // Force change detection
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  private loadApartments(): void {
    // Get current user ID from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      console.error('No user data found in localStorage');
      this.isLoading = false;
      this.cdr.detectChanges(); // Force change detection
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      const ownerId = userData.id;

      this.subscriptions.add(
        this.apartmentService.getApartmentsByOwner(ownerId).subscribe({
          next: (apartments) => {
            this.allApartments = apartments;
            this.apartments = apartments.map(apartment => 
              this.apartmentService.transformToCardData(apartment)
            );
            this.isLoading = false;
            console.log('Loaded apartments for owner:', apartments.length);
            this.cdr.detectChanges(); // Force change detection
          },
          error: (error) => {
            console.error('Error loading apartments:', error);
            this.isLoading = false;
            this.cdr.detectChanges(); // Force change detection for error state
            // You could show a user-friendly error message here
          }
        })
      );
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.isLoading = false;
      this.cdr.detectChanges(); // Force change detection
    }
  }

  onAddApartment(): void {
    // Get current user ID from localStorage since admin is already logged in
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const dialogRef = this.dialogService.openApartmentCreateDialog(userData.id);
        
        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            console.log('Apartment created:', result.apartment);
            // Refresh the apartments list
            this.loadApartments();
          }
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Fallback to mock owner ID
        const dialogRef = this.dialogService.openApartmentCreateDialog(1);
        
        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            console.log('Apartment created:', result.apartment);
            // Refresh the apartments list
            this.loadApartments();
          }
        });
      }
    } else {
      // Fallback to mock owner ID if no user data found
      const dialogRef = this.dialogService.openApartmentCreateDialog(1);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.success) {
          console.log('Apartment created:', result.apartment);
          // Refresh the apartments list
          this.loadApartments();
        }
      });
    }
  }

  trackByApartmentId(index: number, apartment: ApartmentCardData): number {
    return apartment.id;
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.allApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, true);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'edit') {
          this.onEditApartment(apartment);
        } else if (result?.action === 'delete') {
          this.onDeleteApartment(apartment);
        }
      });
    }
  }

  onEditApartment(apartment: ApartmentCardData): void {
    console.log('Edit apartment:', apartment);
    // Open edit dialog or navigate to edit page
  }

  onDeleteApartment(apartment: ApartmentCardData): void {
    const dialogRef = this.dialogService.openConfirmationDialog({
      title: 'Delete Apartment',
      message: `Are you sure you want to delete "<strong>${apartment.name}</strong>"?<br><br>This action cannot be undone and will permanently remove the apartment from your listings.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'delete'
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.subscriptions.add(
          this.apartmentService.deleteApartment(apartment.id).subscribe({
            next: () => {
              console.log('Apartment deleted successfully:', apartment.name);
              this.snackBar.open('Apartment deleted successfully', 'Close', { 
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              
              // Remove the apartment from the local arrays
              this.apartments = this.apartments.filter(apt => apt.id !== apartment.id);
              this.allApartments = this.allApartments.filter(apt => apt.id !== apartment.id);
              
              // Force change detection
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error deleting apartment:', error);
              this.snackBar.open('Failed to delete apartment. Please try again.', 'Close', { 
                duration: 4000,
                panelClass: ['error-snackbar']
              });
            }
          })
        );
      }
    });
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApartmentDialogBase } from '../apartment-dialog-base/apartment-dialog-base';
import { CreateApartmentRequest, ApartmentStatus } from '../../../models/apartment';

@Component({
  selector: 'app-apartment-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: '../apartment-dialog-base/apartment-dialog-template.html',
  styleUrls: ['../apartment-dialog-base/apartment-dialog.css']
})
export class ApartmentCreateDialogComponent extends ApartmentDialogBase implements OnInit {
  // Dialog-specific properties
  dialogTitle = 'Create New Apartment';
  submitButtonText = 'Create Apartment';
  loadingText = 'Creating';
  showStatusField = false;
  imagesRequired = true;

  constructor(
    private dialogRef: MatDialogRef<ApartmentCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: number }
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeBaseForm();
    // Use setTimeout to ensure the view is initialized before loading amenities
    setTimeout(() => {
      this.loadAmenities();
    }, 0);
  }

  protected getInitialFormValues(): any {
    return {
      name: '',
      description: '',
      address: '',
      city: '',
      floor: null,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 1,
      sizeM2: null,
      basePrice: 1,
      status: ApartmentStatus.AVAILABLE
    };
  }

  protected override validateImages(): boolean {
    return this.selectedFiles.length > 0;
  }

  protected override handleSubmitValidationError(): void {
    this.markFormGroupTouched();
    
    // Show specific error messages
    if (!this.apartmentForm.valid && this.selectedFiles.length === 0) {
      this.snackBar.open('Please fill in all required fields and upload at least one image', 'Close', { duration: 4000 });
    } else if (!this.apartmentForm.valid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    } else if (this.selectedFiles.length === 0) {
      this.snackBar.open('Please upload at least one image for the apartment', 'Close', { duration: 3000 });
    }
  }

  protected onSubmitImplementation(): void {
    this.isLoading = true;
    
    const formValue = this.apartmentForm.value;
    const createRequest: CreateApartmentRequest = {
      ownerId: this.data.ownerId,
      name: formValue.name,
      description: formValue.description,
      address: formValue.address,
      city: formValue.city,
      floor: formValue.floor,
      bedrooms: formValue.bedrooms,
      bathrooms: formValue.bathrooms,
      maxGuests: formValue.maxGuests,
      sizeM2: formValue.sizeM2,
      basePrice: formValue.basePrice,
      amenityIds: this.selectedAmenities.map(a => a.id)
    };

    this.apartmentService.createApartment(createRequest).subscribe({
      next: (apartment) => {
        console.log('Apartment created:', apartment);
        
        // Upload images (we know there's at least one)
        this.uploadImages(apartment.id);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating apartment:', error);
        this.snackBar.open('Failed to create apartment. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  private uploadImages(apartmentId: number): void {
    const formData = new FormData();
    
    // Add all selected files to FormData
    this.selectedFiles.forEach((file, index) => {
      formData.append('files', file);
    });
    
    // Add featured image index
    formData.append('featuredIndex', this.featuredImageIndex.toString());

    this.apartmentService.uploadApartmentImages(apartmentId, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Images uploaded successfully:', response);
        this.snackBar.open('Apartment and images uploaded successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error uploading images:', error);
        this.snackBar.open('Apartment created but failed to upload images', 'Close', { duration: 3000 });
        this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
      }
    });
  }

  isSubmitDisabled(): boolean {
    return this.isLoading || this.apartmentForm.invalid || this.selectedFiles.length === 0;
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  protected override handleAmenitiesLoadError(): void {
    // Use the fallback amenities from base class
    super.handleAmenitiesLoadError();
  }
}

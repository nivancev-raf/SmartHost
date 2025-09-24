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
import { Apartment, UpdateApartmentRequest, ApartmentStatus, ApartmentImage } from '../../../models/apartment';

export interface ApartmentEditDialogData {
  apartment: Apartment;
}

@Component({
  selector: 'app-apartment-edit-dialog',
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
export class ApartmentEditDialogComponent extends ApartmentDialogBase implements OnInit {
  // Dialog-specific properties
  dialogTitle = 'Edit Apartment';
  submitButtonText = 'Update Apartment';
  loadingText = 'Updating';
  showStatusField = true;
  imagesRequired = false; // Can save without new images if existing ones remain

  // Edit-specific image properties
  override existingImages: ApartmentImage[] = [];
  override deletedImageIds: number[] = [];
  override isExistingImageFeatured: boolean = true; // Track if featured is existing or new

  constructor(
    private dialogRef: MatDialogRef<ApartmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApartmentEditDialogData
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeBaseForm();
    // Use setTimeout to ensure the view is initialized before loading amenities
    setTimeout(() => {
      this.loadAmenities();
      this.initializeImages();
    }, 0);
  }

  protected getInitialFormValues(): any {
    const apartment = this.data.apartment;
    this.selectedAmenities = [...apartment.amenities];
    
    return {
      name: apartment.name,
      description: apartment.description,
      address: apartment.address,
      city: apartment.city,
      floor: apartment.floor,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      maxGuests: apartment.maxGuests,
      sizeM2: apartment.sizeM2,
      basePrice: apartment.basePrice,
      status: apartment.status
    };
  }

  private initializeImages(): void {
    // Use existing images from apartment data
    this.existingImages = [...(this.data.apartment.images || [])];
    
    // Set featured image index from existing images
    const featuredIndex = this.existingImages.findIndex(img => img.featured);
    if (featuredIndex !== -1) {
      this.featuredImageIndex = featuredIndex;
      this.isExistingImageFeatured = true;
    }
    
    this.cdr.markForCheck();
  }

  protected override validateImages(): boolean {
    // Edit allows no images as long as there are existing images that aren't all deleted
    return (this.existingImages.length - this.deletedImageIds.length + this.selectedFiles.length) > 0;
  }

  protected override handleSubmitValidationError(): void {
    this.markFormGroupTouched();
    
    // Show specific error messages
    const totalImages = this.existingImages.length - this.deletedImageIds.length + this.selectedFiles.length;
    
    if (!this.apartmentForm.valid && totalImages === 0) {
      this.snackBar.open('Please fill in all required fields and ensure at least one image remains', 'Close', { duration: 4000 });
    } else if (!this.apartmentForm.valid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    } else if (totalImages === 0) {
      this.snackBar.open('Please keep at least one image for the apartment', 'Close', { duration: 3000 });
    }
  }

  protected onSubmitImplementation(): void {
    this.isLoading = true;
    
    const formValue = this.apartmentForm.value;
    const updateRequest: UpdateApartmentRequest = {
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
      status: formValue.status,
      amenityIds: this.selectedAmenities.map(a => a.id)
    };

    // First update the apartment
    this.apartmentService.updateApartment(this.data.apartment.id, updateRequest).subscribe({
      next: (updatedApartment) => {
        console.log('Apartment updated:', updatedApartment);
        
        // Handle image operations
        this.handleImageOperations(this.data.apartment.id);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating apartment:', error);
        this.snackBar.open('Failed to update apartment. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  private handleImageOperations(apartmentId: number): void {
    const operations: Promise<any>[] = [];

    // Delete removed images
    this.deletedImageIds.forEach(imageId => {
      operations.push(
        this.apartmentService.deleteApartmentImage(imageId).toPromise()
      );
    });

    // Upload new images if any
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      operations.push(
        this.apartmentService.uploadApartmentImages(apartmentId, formData).toPromise()
      );
    }

    // Execute all operations
    Promise.all(operations).then(() => {
      // Set featured image if needed
      this.setFeaturedImageIfNeeded(apartmentId);
    }).catch((error) => {
      this.isLoading = false;
      console.error('Error with image operations:', error);
      this.snackBar.open('Apartment updated but some image operations failed', 'Close', { duration: 3000 });
      this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
    });
  }

  private setFeaturedImageIfNeeded(apartmentId: number): void {
    let featuredImageId: number | null = null;

    if (this.isExistingImageFeatured) {
      // Featured is an existing image
      const adjustedIndex = this.getFeaturedIndexAfterDeletions();
      if (adjustedIndex !== -1 && adjustedIndex < this.existingImages.length) {
        featuredImageId = this.existingImages[adjustedIndex].id;
      }
    } else {
      // Featured is a new image - we'll need to fetch updated images to get the new image ID
      // For now, skip setting featured for new images
    }

    if (featuredImageId) {
      this.apartmentService.setFeaturedImage(apartmentId, featuredImageId).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Apartment updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error setting featured image:', error);
          this.snackBar.open('Apartment updated but failed to set featured image', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
        }
      });
    } else {
      this.isLoading = false;
      this.snackBar.open('Apartment updated successfully!', 'Close', { duration: 3000 });
      this.dialogRef.close({ success: true, apartment: { id: apartmentId } });
    }
  }

  private getFeaturedIndexAfterDeletions(): number {
    let currentIndex = 0;
    for (let i = 0; i <= this.featuredImageIndex && i < this.existingImages.length; i++) {
      if (!this.deletedImageIds.includes(this.existingImages[i].id)) {
        if (i === this.featuredImageIndex) {
          return currentIndex;
        }
        currentIndex++;
      }
    }
    return -1;
  }

  // Edit-specific image methods
  override removeExistingImage(imageIndex: number): void {
    const imageToDelete = this.existingImages[imageIndex];
    this.deletedImageIds.push(imageToDelete.id);
    
    // Adjust featured image if necessary
    if (this.isExistingImageFeatured && this.featuredImageIndex === imageIndex) {
      // Find the next available existing image or switch to new images
      let newFeaturedIndex = -1;
      for (let i = 0; i < this.existingImages.length; i++) {
        if (i !== imageIndex && !this.deletedImageIds.includes(this.existingImages[i].id)) {
          newFeaturedIndex = i;
          break;
        }
      }
      
      if (newFeaturedIndex !== -1) {
        this.featuredImageIndex = newFeaturedIndex;
      } else if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = false;
      }
    }
    
    this.cdr.markForCheck();
  }

  override removeNewImage(index: number): void {
    // This is for new images
    this.selectedFiles.splice(index, 1);
    
    // Adjust featured image if necessary
    if (!this.isExistingImageFeatured && this.featuredImageIndex === index) {
      if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
      } else {
        // Switch to existing images
        const firstAvailableExisting = this.existingImages.findIndex(img => 
          !this.deletedImageIds.includes(img.id)
        );
        if (firstAvailableExisting !== -1) {
          this.featuredImageIndex = firstAvailableExisting;
          this.isExistingImageFeatured = true;
        }
      }
    } else if (!this.isExistingImageFeatured && this.featuredImageIndex > index) {
      this.featuredImageIndex--;
    }
    
    this.cdr.markForCheck();
  }

  override setFeaturedExistingImage(imageIndex: number): void {
    this.featuredImageIndex = imageIndex;
    this.isExistingImageFeatured = true;
    this.cdr.markForCheck();
  }

  override setFeaturedNewImage(fileIndex: number): void {
    this.featuredImageIndex = fileIndex;
    this.isExistingImageFeatured = false;
    this.cdr.markForCheck();
  }

  override getExistingImageUrl(image: ApartmentImage): string {
    if (image.url.startsWith('http')) {
      return image.url;
    }
    return `http://localhost:8080${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }

  isSubmitDisabled(): boolean {
    const totalImages = this.existingImages.length - this.deletedImageIds.length + this.selectedFiles.length;
    return this.isLoading || this.apartmentForm.invalid || totalImages === 0;
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  protected override handleAmenitiesLoadError(): void {
    // For edit dialog, fall back to current apartment amenities instead of hardcoded ones
    this.availableAmenities = [...this.selectedAmenities];
    this.cdr.markForCheck();
    this.snackBar.open('Failed to load all amenities, showing current ones only', 'Close', { duration: 3000 });
  }
}

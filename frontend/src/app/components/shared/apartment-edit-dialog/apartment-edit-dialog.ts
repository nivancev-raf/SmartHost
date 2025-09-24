import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApartmentService } from '../../../services/apartment.service';
import { Apartment, UpdateApartmentRequest, ApartmentStatus, AmenityDto, ApartmentImage } from '../../../models/apartment';

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
  templateUrl: './apartment-edit-dialog.html',
  styleUrl: './apartment-edit-dialog.css'
})
export class ApartmentEditDialogComponent implements OnInit {
  apartmentForm!: FormGroup;
  availableAmenities: AmenityDto[] = [];
  selectedAmenities: AmenityDto[] = [];
  
  // Image handling properties
  existingImages: ApartmentImage[] = [];
  selectedFiles: File[] = [];
  deletedImageIds: number[] = [];
  featuredImageIndex: number = 0;
  isExistingImageFeatured: boolean = true; // Track if featured is existing or new
  
  isLoading = false;
  isLoadingAmenities = true;
  isLoadingImages = false; // No longer need to load images from API

  statusOptions = [
    { value: ApartmentStatus.AVAILABLE, label: 'Available' },
    { value: ApartmentStatus.BOOKED, label: 'Booked' },
    { value: ApartmentStatus.CLEANING, label: 'Cleaning' }
  ];

  cities = ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica'];

  constructor(
    private fb: FormBuilder,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ApartmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApartmentEditDialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // Use setTimeout to ensure the view is initialized before loading amenities
    setTimeout(() => {
      this.loadAmenities();
      this.initializeImages();
    }, 0);
  }

  private initializeForm(): void {
    const apartment = this.data.apartment;
    
    this.apartmentForm = this.fb.group({
      name: [apartment.name, [Validators.required, Validators.minLength(3)]],
      description: [apartment.description, [Validators.required, Validators.minLength(10)]],
      address: [apartment.address, [Validators.required]],
      city: [apartment.city, [Validators.required]],
      floor: [apartment.floor],
      bedrooms: [apartment.bedrooms, [Validators.required, Validators.min(0)]],
      bathrooms: [apartment.bathrooms, [Validators.required, Validators.min(1)]],
      maxGuests: [apartment.maxGuests, [Validators.required, Validators.min(1)]],
      sizeM2: [apartment.sizeM2, [Validators.min(1)]],
      basePrice: [apartment.basePrice, [Validators.required, Validators.min(1)]],
      status: [apartment.status, [Validators.required]]
    });

    // Pre-populate selected amenities
    this.selectedAmenities = [...apartment.amenities];
  }

  private loadAmenities(): void {
    this.isLoadingAmenities = true;
    
    this.apartmentService.getAllAmenities().subscribe({
      next: (amenities) => {
        this.availableAmenities = [...amenities];
        this.isLoadingAmenities = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading amenities:', error);
        this.isLoadingAmenities = false;
        this.snackBar.open('Failed to load amenities', 'Close', { duration: 3000 });
        // Fallback to current amenities
        this.availableAmenities = [...this.selectedAmenities];
        this.cdr.markForCheck();
      }
    });
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
    
    this.isLoadingImages = false;
    this.cdr.markForCheck();
  }

  onAmenityToggle(amenity: AmenityDto): void {
    setTimeout(() => {
      const index = this.selectedAmenities.findIndex(a => a.id === amenity.id);
      if (index > -1) {
        // Remove amenity
        this.selectedAmenities = this.selectedAmenities.filter(a => a.id !== amenity.id);
      } else {
        // Add amenity
        this.selectedAmenities = [...this.selectedAmenities, amenity];
      }
      this.cdr.markForCheck();
    }, 0);
  }

  isAmenitySelected(amenity: AmenityDto): boolean {
    return this.selectedAmenities.some(a => a.id === amenity.id);
  }

  removeAmenity(amenity: AmenityDto): void {
    setTimeout(() => {
      this.selectedAmenities = this.selectedAmenities.filter(a => a.id !== amenity.id);
      this.cdr.markForCheck();
    }, 0);
  }

  // Image handling methods
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      this.selectedFiles = [...this.selectedFiles, ...filesArray];
      
      // If this is the first image (no existing images), make it featured
      if (this.existingImages.length === 0 && this.selectedFiles.length === filesArray.length) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = false;
      }
      
      this.cdr.markForCheck();
    }
  }

  removeExistingImage(imageIndex: number): void {
    const imageToDelete = this.existingImages[imageIndex];
    this.deletedImageIds.push(imageToDelete.id);
    this.existingImages.splice(imageIndex, 1);
    
    // Adjust featured image if necessary
    if (this.isExistingImageFeatured && this.featuredImageIndex === imageIndex) {
      // If the deleted image was featured, make the first available image featured
      if (this.existingImages.length > 0) {
        this.featuredImageIndex = 0;
      } else if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = false;
      }
    } else if (this.isExistingImageFeatured && this.featuredImageIndex > imageIndex) {
      this.featuredImageIndex--;
    }
    
    this.cdr.markForCheck();
  }

  removeNewImage(fileIndex: number): void {
    this.selectedFiles.splice(fileIndex, 1);
    
    // Adjust featured image if necessary
    if (!this.isExistingImageFeatured && this.featuredImageIndex === fileIndex) {
      // If the deleted file was featured, make the first available image featured
      if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
      } else if (this.existingImages.length > 0) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = true;
      }
    } else if (!this.isExistingImageFeatured && this.featuredImageIndex > fileIndex) {
      this.featuredImageIndex--;
    }
    
    this.cdr.markForCheck();
  }

  setFeaturedExistingImage(imageIndex: number): void {
    this.featuredImageIndex = imageIndex;
    this.isExistingImageFeatured = true;
    this.cdr.markForCheck();
  }

  setFeaturedNewImage(fileIndex: number): void {
    this.featuredImageIndex = fileIndex;
    this.isExistingImageFeatured = false;
    this.cdr.markForCheck();
  }

  getNewImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  getExistingImageUrl(image: ApartmentImage): string {
    if (image.url.startsWith('http')) {
      return image.url;
    }
    return `http://localhost:8080${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }

  onSubmit(): void {
    if (this.apartmentForm.valid) {
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

      this.apartmentService.updateApartment(this.data.apartment.id, updateRequest).subscribe({
        next: (apartment) => {
          console.log('Apartment updated:', apartment);
          
          // Handle image operations after apartment update
          this.handleImageOperations(apartment.id);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating apartment:', error);
          this.snackBar.open('Failed to update apartment. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  private handleImageOperations(apartmentId: number): void {
    let operationsCompleted = 0;
    const totalOperations = this.deletedImageIds.length + 
                           (this.selectedFiles.length > 0 ? 1 : 0) + 
                           (this.shouldUpdateFeaturedImage() ? 1 : 0);

    if (totalOperations === 0) {
      this.completeUpdate();
      return;
    }

    const checkCompletion = () => {
      operationsCompleted++;
      if (operationsCompleted >= totalOperations) {
        this.completeUpdate();
      }
    };

    // Delete marked images
    this.deletedImageIds.forEach(imageId => {
      this.apartmentService.deleteApartmentImage(imageId).subscribe({
        next: () => {
          console.log('Image deleted:', imageId);
          checkCompletion();
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          checkCompletion(); // Continue even if one deletion fails
        }
      });
    });

    // Upload new images
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      this.apartmentService.uploadApartmentImages(apartmentId, formData).subscribe({
        next: () => {
          console.log('New images uploaded');
          checkCompletion();
        },
        error: (error) => {
          console.error('Error uploading images:', error);
          checkCompletion(); // Continue even if upload fails
        }
      });
    }

    // Update featured image if needed
    if (this.shouldUpdateFeaturedImage()) {
      if (this.isExistingImageFeatured) {
        const featuredImage = this.existingImages[this.featuredImageIndex];
        this.apartmentService.setFeaturedImage(apartmentId, featuredImage.id).subscribe({
          next: () => {
            console.log('Featured image updated');
            checkCompletion();
          },
          error: (error) => {
            console.error('Error updating featured image:', error);
            checkCompletion(); // Continue even if this fails
          }
        });
      } else {
        // For new images, the backend should handle featuring during upload
        checkCompletion();
      }
    }
  }

  private shouldUpdateFeaturedImage(): boolean {
    // Check if the featured image selection has changed
    const originalFeaturedImage = this.data.apartment.images?.find(img => img.featured);
    if (!originalFeaturedImage && this.isExistingImageFeatured && this.existingImages.length > 0) {
      return true;
    }
    if (originalFeaturedImage && this.isExistingImageFeatured) {
      const currentFeaturedImage = this.existingImages[this.featuredImageIndex];
      return currentFeaturedImage?.id !== originalFeaturedImage.id;
    }
    return !this.isExistingImageFeatured; // New file is featured
  }

  private completeUpdate(): void {
    this.isLoading = false;
    this.snackBar.open('Apartment updated successfully!', 'Close', { duration: 3000 });
    this.dialogRef.close({ success: true, apartment: this.data.apartment });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.apartmentForm.controls).forEach(key => {
      const control = this.apartmentForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getFieldError(fieldName: string): string {
    const control = this.apartmentForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Name',
      description: 'Description',
      address: 'Address',
      city: 'City',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      maxGuests: 'Maximum Guests',
      sizeM2: 'Size',
      basePrice: 'Base Price'
    };
    return fieldNames[fieldName] || fieldName;
  }
}

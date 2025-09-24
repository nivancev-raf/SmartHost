import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApartmentService } from '../../../services/apartment.service';
import { ApartmentStatus, AmenityDto, ApartmentImage } from '../../../models/apartment';

@Component({
  template: '',
  standalone: true
})
export abstract class ApartmentDialogBase {
  // Injected services
  protected fb = inject(FormBuilder);
  protected apartmentService = inject(ApartmentService);
  protected snackBar = inject(MatSnackBar);
  protected cdr = inject(ChangeDetectorRef);

  // Form and amenities
  apartmentForm!: FormGroup;
  availableAmenities: AmenityDto[] = [];
  selectedAmenities: AmenityDto[] = [];
  isLoadingAmenities = true;

  // Image handling properties
  existingImages: ApartmentImage[] = [];
  selectedFiles: File[] = [];
  deletedImageIds: number[] = [];
  featuredImageIndex: number = 0;
  isExistingImageFeatured: boolean = true;
  isLoadingImages = false;

  // Loading states
  isLoading = false;

  // Common options
  statusOptions = [
    { value: ApartmentStatus.AVAILABLE, label: 'Available' },
    { value: ApartmentStatus.BOOKED, label: 'Booked' },
    { value: ApartmentStatus.CLEANING, label: 'Cleaning' }
  ];

  cities = ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica'];

  // Abstract methods that child components must implement
  protected abstract getInitialFormValues(): any;
  protected abstract onSubmitImplementation(): void;

  protected initializeBaseForm(): void {
    const initialValues = this.getInitialFormValues();
    
    this.apartmentForm = this.fb.group({
      name: [initialValues.name || '', [Validators.required, Validators.minLength(3)]],
      description: [initialValues.description || '', [Validators.required, Validators.minLength(10)]],
      address: [initialValues.address || '', [Validators.required]],
      city: [initialValues.city || '', [Validators.required]],
      floor: [initialValues.floor || null],
      bedrooms: [initialValues.bedrooms || 1, [Validators.required, Validators.min(0)]],
      bathrooms: [initialValues.bathrooms || 1, [Validators.required, Validators.min(1)]],
      maxGuests: [initialValues.maxGuests || 1, [Validators.required, Validators.min(1)]],
      sizeM2: [initialValues.sizeM2 || null, [Validators.min(1)]],
      basePrice: [initialValues.basePrice || 1, [Validators.required, Validators.min(1)]],
      status: [initialValues.status || ApartmentStatus.AVAILABLE, [Validators.required]]
    });
  }

  protected loadAmenities(): void {
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
        this.handleAmenitiesLoadError();
        this.cdr.markForCheck();
      }
    });
  }

  protected handleAmenitiesLoadError(): void {
    // Fallback amenities - can be overridden by child classes
    this.availableAmenities = [
      { id: 1, name: 'Wi-Fi' },
      { id: 2, name: 'Air Conditioning' },
      { id: 3, name: 'Kitchen' },
      { id: 4, name: 'Parking' },
      { id: 5, name: 'Balcony' },
      { id: 6, name: 'TV' },
      { id: 7, name: 'Washing Machine' },
      { id: 8, name: 'City View' },
      { id: 9, name: 'Terrace' }
    ];
  }

  // Amenity management methods
  onAmenityToggle(amenity: AmenityDto): void {
    setTimeout(() => {
      const index = this.selectedAmenities.findIndex(a => a.id === amenity.id);
      if (index > -1) {
        this.selectedAmenities = this.selectedAmenities.filter(a => a.id !== amenity.id);
      } else {
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
      
      // If this is the first image and no existing images, make it featured
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
    
    this.adjustFeaturedImageAfterExistingRemoval(imageIndex);
    this.cdr.markForCheck();
  }

  removeNewImage(fileIndex: number): void {
    this.selectedFiles.splice(fileIndex, 1);
    
    this.adjustFeaturedImageAfterNewRemoval(fileIndex);
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

  // Helper methods for featured image adjustment
  private adjustFeaturedImageAfterExistingRemoval(removedIndex: number): void {
    if (this.isExistingImageFeatured && this.featuredImageIndex === removedIndex) {
      // If the deleted image was featured, make the first available image featured
      if (this.existingImages.length > 0) {
        this.featuredImageIndex = 0;
      } else if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = false;
      }
    } else if (this.isExistingImageFeatured && this.featuredImageIndex > removedIndex) {
      this.featuredImageIndex--;
    }
  }

  private adjustFeaturedImageAfterNewRemoval(removedIndex: number): void {
    if (!this.isExistingImageFeatured && this.featuredImageIndex === removedIndex) {
      // If the deleted file was featured, make the first available image featured
      if (this.selectedFiles.length > 0) {
        this.featuredImageIndex = 0;
      } else if (this.existingImages.length > 0) {
        this.featuredImageIndex = 0;
        this.isExistingImageFeatured = true;
      }
    } else if (!this.isExistingImageFeatured && this.featuredImageIndex > removedIndex) {
      this.featuredImageIndex--;
    }
  }

  // Form validation methods
  protected markFormGroupTouched(): void {
    Object.keys(this.apartmentForm.controls).forEach(key => {
      const control = this.apartmentForm.get(key);
      control?.markAsTouched();
    });
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

  // Template method pattern - child classes call this
  onSubmit(): void {
    if (this.apartmentForm.valid && this.validateImages()) {
      this.onSubmitImplementation();
    } else {
      this.handleSubmitValidationError();
    }
  }

  protected validateImages(): boolean {
    // For create dialog, at least one image is required
    // For edit dialog, images are optional
    return true; // Override in child classes if needed
  }

  protected handleSubmitValidationError(): void {
    this.markFormGroupTouched();
    this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
  }

  // Image helper methods for template
  isImageDeleted(image: ApartmentImage): boolean {
    return this.deletedImageIds.includes(image.id);
  }

  isFeaturedExistingImage(imageIndex: number): boolean {
    return this.isExistingImageFeatured && this.featuredImageIndex === imageIndex;
  }

  isFeaturedNewImage(fileIndex: number): boolean {
    return !this.isExistingImageFeatured && this.featuredImageIndex === fileIndex;
  }
}

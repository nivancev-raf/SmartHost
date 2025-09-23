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
import { CreateApartmentRequest, ApartmentStatus, AmenityDto } from '../../../models/apartment';

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
  templateUrl: './apartment-create-dialog.html',
  styleUrl: './apartment-create-dialog.css'
})
export class ApartmentCreateDialogComponent implements OnInit {
  apartmentForm!: FormGroup;
  availableAmenities: AmenityDto[] = [];
  selectedAmenities: AmenityDto[] = [];
  isLoading = false;
  isLoadingAmenities = true;

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
    private dialogRef: MatDialogRef<ApartmentCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // Use setTimeout to ensure the view is initialized before loading amenities
    setTimeout(() => {
      this.loadAmenities();
    }, 0);
  }

  private initializeForm(): void {
    this.apartmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      floor: [null],
      bedrooms: [1, [Validators.required, Validators.min(0)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]],
      maxGuests: [1, [Validators.required, Validators.min(1)]],
      sizeM2: [null, [Validators.min(1)]],
      basePrice: [1, [Validators.required, Validators.min(1)]],
      status: [ApartmentStatus.AVAILABLE, [Validators.required]]
    });
  }

  private loadAmenities(): void {
    this.isLoadingAmenities = true;
    
    this.apartmentService.getAllAmenities().subscribe({
      next: (amenities) => {
        this.availableAmenities = [...amenities]; // Create new array
        this.isLoadingAmenities = false;
        this.cdr.markForCheck(); // Use markForCheck instead of detectChanges
      },
      error: (error) => {
        console.error('Error loading amenities:', error);
        this.isLoadingAmenities = false;
        this.snackBar.open('Failed to load amenities', 'Close', { duration: 3000 });
        // Fallback to mock amenities
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
        this.cdr.markForCheck();
      }
    });
  }

  onAmenityToggle(amenity: AmenityDto): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
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

  onSubmit(): void {
    if (this.apartmentForm.valid) {
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
          this.isLoading = false;
          this.snackBar.open('Apartment created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, apartment });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating apartment:', error);
          this.snackBar.open('Failed to create apartment. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
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

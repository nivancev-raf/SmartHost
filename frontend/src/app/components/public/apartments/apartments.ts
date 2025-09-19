import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApartmentCardWideComponent } from '../../shared/apartment-card-wide/apartment-card-wide';
import { Apartment, ApartmentCardData, ApartmentStatus, AmenityDto } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-apartments',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatChipsModule,
    ApartmentCardWideComponent
  ],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css'
})
export class Apartments implements OnInit, OnDestroy {
  apartments: ApartmentCardData[] = [];
  allApartments: Apartment[] = [];
  filteredApartments: Apartment[] = [];
  totalApartments: number = 0;
  isLoading: boolean = true;
  filterForm!: FormGroup;
  private subscriptions = new Subscription();

  // Filter options
  cities = ['Belgrade', 'Novi Sad', 'Nis'];
  amenities: AmenityDto[] = [];
  priceRange = { min: 30, max: 150 };

  // Mock data - in real app this would come from API
  private mockApartments: Apartment[] = [
    {
      id: 1,
      ownerId: 1,
      name: 'Aqua View Studio',
      description: 'Modern studio with beautiful city views and all amenities included.',
      address: 'Knez Mihailova 12',
      city: 'Belgrade',
      floor: 3,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      sizeM2: 45,
      basePrice: 55,
      status: ApartmentStatus.AVAILABLE,
      createdAt: new Date().toISOString(),
      amenities: [
        { id: 1, name: 'Wi-Fi' },
        { id: 2, name: 'Air Conditioning' },
        { id: 3, name: 'Kitchen' },
        { id: 6, name: 'TV' },
        { id: 4, name: 'Parking' }
      ],
      rating: 4.8,
      currency: '€',
      images: [
        {
          id: 1,
          apartmentId: 1,
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
          isFeatured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          apartmentId: 1,
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
          isFeatured: false,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 2,
      ownerId: 1,
      name: 'Luxury Downtown Apartment',
      description: 'Spacious 2-bedroom apartment in the heart of Belgrade with premium amenities.',
      address: 'Terazije 25',
      city: 'Belgrade',
      floor: 5,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      sizeM2: 80,
      basePrice: 95,
      status: ApartmentStatus.AVAILABLE,
      createdAt: new Date().toISOString(),
      amenities: [
        { id: 1, name: 'Wi-Fi' },
        { id: 2, name: 'Air Conditioning' },
        { id: 3, name: 'Kitchen' },
        { id: 5, name: 'Balcony' },
        { id: 6, name: 'TV' },
        { id: 7, name: 'Washing Machine' },
        { id: 8, name: 'City View' }
      ],
      rating: 4.9,
      currency: '€',
      images: [
        {
          id: 3,
          apartmentId: 2,
          url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          isFeatured: true,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 3,
      ownerId: 2,
      name: 'Cozy Garden Studio',
      description: 'Charming studio apartment with private terrace and garden access.',
      address: 'Skadarska 15',
      city: 'Belgrade',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      sizeM2: 35,
      basePrice: 45,
      status: ApartmentStatus.AVAILABLE,
      createdAt: new Date().toISOString(),
      amenities: [
        { id: 1, name: 'Wi-Fi' },
        { id: 3, name: 'Kitchen' },
        { id: 6, name: 'TV' },
        { id: 9, name: 'Terrace' }
      ],
      rating: 4.6,
      currency: '€',
      images: [
        {
          id: 4,
          apartmentId: 3,
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
          isFeatured: true,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  constructor(
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    this.initializeFilterForm();
    this.loadAmenities();
    this.loadApartments();
    this.handleQueryParams();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      location: [''],
      priceMin: [this.priceRange.min],
      priceMax: [this.priceRange.max],
      guests: [''],
      amenities: [[]]
    });
  }

  private handleQueryParams(): void {
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        if (params['location']) {
          this.filterForm.patchValue({ location: params['location'] });
        }
        if (params['guests']) {
          this.filterForm.patchValue({ guests: params['guests'] });
        }
        // Only apply filters if apartments are already loaded
        if (this.allApartments.length > 0) {
          this.applyFilters();
        }
      })
    );
  }

  private setupFilterSubscription(): void {
    this.subscriptions.add(
      this.filterForm.valueChanges.subscribe(() => {
        // Only apply filters if apartments are already loaded
        if (this.allApartments.length > 0) {
          this.applyFilters();
        }
      })
    );
  }

  private loadAmenities(): void {
    this.subscriptions.add(
      this.apartmentService.getAllAmenities().subscribe({
        next: (amenities) => {
          this.amenities = amenities;
          console.log('Loaded amenities:', this.amenities);
        },
        error: (error) => {
          console.error('Error loading amenities:', error);
          // Fallback to mock data if backend is not available
          this.amenities = [
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
      })
    );
  }

  private loadApartments(): void {
    console.log('Starting to load apartments...'); // Debug log
    this.isLoading = true;
    
    // Use mock data immediately - no need for setTimeout with mock data
    console.log('Loading apartments...', this.mockApartments.length); // Debug log
    this.allApartments = this.mockApartments;
    this.filteredApartments = [...this.mockApartments];
    this.totalApartments = this.mockApartments.length;
    this.apartments = this.mockApartments.map(apt => 
      this.apartmentService.transformToCardData(apt)
    );
    this.isLoading = false;
    console.log('Apartments loaded immediately:', this.apartments.length); // Debug log
    
    // Apply any existing filters after loading
    this.applyFilters();
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredApartments = this.allApartments.filter(apartment => {
      // Location filter (using city from apartment model)
      if (filters.location && !apartment.city.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Price filter (using basePrice from apartment model)
      if ((filters.priceMin && apartment.basePrice < filters.priceMin) ||
          (filters.priceMax && apartment.basePrice > filters.priceMax)) {
        return false;
      }

      // Guests filter
      if (filters.guests && apartment.maxGuests && apartment.maxGuests < filters.guests) {
        return false;
      }

      if (filters.amenities && filters.amenities.length > 0) {
        const apartmentAmenityIds = apartment.amenities?.map((a: AmenityDto) => a.id) || [];
        const requiredAmenityIds = filters.amenities.map((a: AmenityDto) => a.id);
        
        if (!requiredAmenityIds.every((amenityId: number) => apartmentAmenityIds.includes(amenityId))) {
          return false;
        }
      }

      return true;
    });

    // Update total count and transform to card data for display
    this.totalApartments = this.filteredApartments.length;
    this.apartments = this.filteredApartments.map(apt => 
      this.apartmentService.transformToCardData(apt)
    );
    
    console.log('Filters applied, showing:', this.apartments.length, 'apartments'); // Debug log
  }

  public clearFilters(): void {
    this.filterForm.reset({
      location: '',
      priceMin: this.priceRange.min,
      priceMax: this.priceRange.max,
      guests: '',
      amenities: []
    });
    this.router.navigate([], { relativeTo: this.route });
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.allApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, false);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'book') {
          this.onBookApartmentFull(result.apartment);
        }
      });
    }
  }

  public onBookApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for booking
    const fullApartment = this.allApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      this.onBookApartmentFull(fullApartment);
    }
  }

  private onBookApartmentFull(apartment: Apartment): void {
    console.log('Book apartment:', apartment);
    // TODO: Implement booking functionality
  }

  trackByApartmentId(index: number, apartment: ApartmentCardData): number {
    return apartment.id;
  }

  formatPriceLabel = (value: number): string => {
    return `€${value}`;
  }
}

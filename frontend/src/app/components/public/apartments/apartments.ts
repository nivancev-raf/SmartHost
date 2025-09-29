import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApartmentCardWideComponent } from '../../shared/apartment-card-wide/apartment-card-wide';
import { Apartment, ApartmentCardData, AmenityDto } from '../../../models/apartment';
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
    MatDatepickerModule,
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
  searchForm!: FormGroup;
  private subscriptions = new Subscription();

  // Track if search form has changed
  hasSearchFormChanged: boolean = false;
  private originalSearchValues: any = {};

  // Hero image for the apartments page
  heroImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&h=1080&fit=crop&crop=center';

  // Current search parameters
  currentSearchParams: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  } | null = null;

  // Filter options
  cities = ['Belgrade', 'Novi Sad', 'Nis'];
  amenities: AmenityDto[] = [];
  priceRange = { min: 30, max: 150 };

  constructor(
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private viewportScroller: ViewportScroller
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    // Always scroll to top when navigating to apartments page
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.initializeFilterForm();
    this.initializeSearchForm();
    this.loadAmenities();
    // Don't load apartments by default - only via search parameters
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
      amenities: [[]]
    });
  }

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      checkIn: [''],
      checkOut: [''],
      guests: ['']
    });

    // Subscribe to form changes to enable/disable search button
    this.subscriptions.add(
      this.searchForm.valueChanges.subscribe(() => {
        this.checkSearchFormChanges();
      })
    );
  }

  private checkSearchFormChanges(): void {
    const currentValues = this.searchForm.value;
    this.hasSearchFormChanged = JSON.stringify(currentValues) !== JSON.stringify(this.originalSearchValues);
  }

  private handleQueryParams(): void {
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        // Store search parameters
        const checkIn = params['checkIn'];
        const checkOut = params['checkOut'];
        const guests = params['guests'];
        const apartmentId = params['apartmentId'];
        
        if (checkIn && checkOut) {
          // Store current search parameters for reservation
          this.currentSearchParams = {
            checkIn,
            checkOut,
            guests: guests ? parseInt(guests) : undefined
          };
          
          // Populate search form with current values
          const searchFormValues = {
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: guests || '2'
          };
          this.searchForm.patchValue(searchFormValues); // patch values to avoid emitting event
          
          // Store original values to track changes
          this.originalSearchValues = { ...searchFormValues };
          this.hasSearchFormChanged = false;
          
          // Load available apartments for those dates (apartmentId helps backend prioritize specific apartment)
          this.loadAvailableApartments(
            new Date(checkIn), 
            new Date(checkOut), 
            guests ? parseInt(guests) : undefined,
            apartmentId ? parseInt(apartmentId) : undefined
          );
          // Update form with the search parameters
          this.filterForm.patchValue({ 
            location: params['location'] || ''
          });
        } else {
          // If no dates provided, redirect to home page (apartments should only be accessed via search)
          this.router.navigate(['/']);
          return;
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
    // This method is now only used as fallback - apartments should be accessed via search
    console.warn('Apartments accessed without search parameters - redirecting to home');
    this.router.navigate(['/']);
  }

  private loadAvailableApartments(checkIn: Date, checkOut: Date, guests?: number, apartmentId?: number): void {
    this.isLoading = true;
    
    this.subscriptions.add(
      this.apartmentService.getAvailableApartments(checkIn, checkOut, guests, apartmentId).subscribe({
        next: (apartments: Apartment[]) => {
          console.log('Loaded available apartments from API:', apartments.length);
          // Filter by guest capacity if specified
          let filteredApartments = apartments;
          if (guests) {
            filteredApartments = apartments.filter(apt => 
              apt.maxGuests && apt.maxGuests >= guests
            );
          }
          
          this.allApartments = filteredApartments;
          this.filteredApartments = [...this.allApartments];
          this.totalApartments = this.allApartments.length;
          this.apartments = this.allApartments.map(apt => 
            this.apartmentService.transformToCardData(apt)
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error loading available apartments from API:', error);
          // Fallback - show empty array if API fails
          this.allApartments = [];
          this.filteredApartments = [];
          this.totalApartments = 0;
          this.apartments = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
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
    // Open reservation dialog with search parameters
    if (this.currentSearchParams?.checkIn && this.currentSearchParams?.checkOut) {
      this.dialogService.openReservationDialog(
        apartment, 
        this.currentSearchParams.checkIn, 
        this.currentSearchParams.checkOut, 
        this.currentSearchParams.guests || 1
      );
    } else {
      // Fallback if no search params (shouldn't happen in normal flow)
      console.error('No search parameters available for booking');
    }
  }

  trackByApartmentId(index: number, apartment: ApartmentCardData): number {
    return apartment.id;
  }

  formatPriceLabel = (value: number): string => {
    return `€${value}`;
  }

  onSearchApartments(): void {
    const formValues = this.searchForm.value;
    
    if (formValues.checkIn && formValues.checkOut && formValues.guests) {
      // Format dates for URL
      const checkInDate = new Date(formValues.checkIn).toISOString().split('T')[0];
      const checkOutDate = new Date(formValues.checkOut).toISOString().split('T')[0];
      
      // Navigate to apartments with new search parameters
      this.router.navigate(['/apartments'], {
        queryParams: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: formValues.guests
        }
      });
    }
  }
}

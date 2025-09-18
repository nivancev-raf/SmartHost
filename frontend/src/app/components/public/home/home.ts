import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../../layout/hero-section/hero-section';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';
import { ApartmentCardData, Apartment, ApartmentStatus } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButtonModule,
    HeroSectionComponent,
    ApartmentCardComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  apartments: ApartmentCardData[] = [];
  featuredApartments: ApartmentCardData[] = []; // Show only featured ones on home
  private mockFullApartments: Apartment[] = []; // Store full data for dialog

  constructor(
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load featured apartments for home page (first 6)
    this.mockFullApartments = this.getMockFullApartments();
    this.apartments = this.mockFullApartments
      .slice(0, 6) // Show only first 6 on home page
      .map(apt => this.apartmentService.transformToCardData(apt));
  }

  private loadApartments(): void {
    this.apartmentService.getApartments().subscribe({
      next: (apartments) => {
        this.apartments = apartments.slice(0, 6); // Show only featured
      },
      error: (error) => {
        console.error('Error loading apartments:', error);
        // Fallback to mock data
        this.apartments = this.getMockApartments().slice(0, 6);
      }
    });
  }

  private getMockFullApartments(): Apartment[] {
    return [
      {
        id: 1,
        ownerId: 1,
        name: 'Aqua View Studio',
        description: 'Modern studio with beautiful city views and premium amenities. Perfect for couples or solo travelers.',
        address: 'Knez Mihailova 12',
        city: 'Beograd',
        floor: 3,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        sizeM2: 45,
        basePrice: 55,
        status: ApartmentStatus.AVAILABLE,
        createdAt: new Date().toISOString(),
        amenities: ['Wi-Fi', 'Klima', 'Kuhinja', 'TV', 'Balkon'],
        rating: 4.8,
        currency: '€',
        images: [
          {
            id: 1,
            apartmentId: 1,
            imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
            isPrimary: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            apartmentId: 1,
            imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
            isPrimary: false,
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 2,
        ownerId: 1,
        name: 'Urban Loft Dorcol',
        description: 'Stylish loft in the heart of Dorcol with exposed brick walls and modern furnishings.',
        address: 'Cara Dusana 45',
        city: 'Beograd',
        floor: 2,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 3,
        sizeM2: 62,
        basePrice: 72,
        status: ApartmentStatus.AVAILABLE,
        createdAt: new Date().toISOString(),
        amenities: ['Wi-Fi', 'Balkon', 'Perionica', 'TV'],
        rating: 4.9,
        currency: '€',
        images: [
          {
            id: 3,
            apartmentId: 2,
            imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
            isPrimary: true,
            createdAt: new Date().toISOString()
          }
        ]
      },
      // Add more apartments as needed...
    ];
  }

  private getMockApartments(): ApartmentCardData[] {
    return [
      {
        id: 1,
        name: 'Aqua View Studio',
        location: 'Beograd',
        rating: 4.8,
        guests: 2,
        price: 55,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Klima', 'Kuhinja'],
        description: 'Modern studio with beautiful city views'
      },
      {
        id: 2,
        name: 'Urban Loft Dorcol',
        location: 'Beograd',
        rating: 4.9,
        guests: 3,
        price: 72,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Balkon', 'Perionica'],
        description: 'Stylish loft in the heart of Dorcol'
      },
      {
        id: 3,
        name: 'Kalemegdan Terrace',
        location: 'Beograd',
        rating: 4.7,
        guests: 4,
        price: 95,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Parking', 'Pogled'],
        description: 'Beautiful apartment with terrace and park view'
      },
      {
        id: 4,
        name: 'Zen Garden Suite',
        location: 'Beograd',
        rating: 4.6,
        guests: 2,
        price: 68,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Balkon', 'Klima'],
        description: 'Peaceful suite with garden access'
      },
      {
        id: 5,
        name: 'City Center Loft',
        location: 'Beograd',
        rating: 4.8,
        guests: 4,
        price: 85,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Parking', 'Kuhinja'],
        description: 'Modern loft in the city center'
      },
      {
        id: 6,
        name: 'Riverside Apartment',
        location: 'Beograd',
        rating: 4.9,
        guests: 3,
        price: 78,
        currency: '€',
        imageUrl: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=400&h=250&fit=crop',
        amenities: ['Wi-Fi', 'Pogled', 'Terasa'],
        description: 'Stunning apartment with river views'
      }
    ];
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.mockFullApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, false);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'book') {
          this.onBookApartment(result.apartment);
        }
      });
    }
  }

  // Navigate to full apartments catalog
  onViewAllApartments(): void {
    this.router.navigate(['/apartments']);
  }

  // Handle search from hero section
  onSearchApartments(searchData: any): void {
    // Navigate to apartments page with search parameters
    this.router.navigate(['/apartments'], {
      queryParams: {
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
        location: searchData.location
      }
    });
  }

  private onBookApartment(apartment: Apartment): void {
    console.log('Book apartment:', apartment);
    // TODO: Navigate to booking page or open booking dialog
    // this.router.navigate(['/booking'], { queryParams: { apartmentId: apartment.id } });
  }
}

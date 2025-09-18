import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';
import { Apartment, ApartmentCardData, ApartmentStatus } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-apartments',
  imports: [CommonModule, ApartmentCardComponent],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css'
})
export class Apartments implements OnInit {
  apartments: ApartmentCardData[] = [];
  isLoading: boolean = true;

  // Mock data - in real app this would come from API
  private mockApartments: Apartment[] = [
    {
      id: 1,
      ownerId: 1,
      name: 'Aqua View Studio',
      description: 'Modern studio with beautiful city views and all amenities included.',
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
      amenities: ['Wi-Fi', 'Klima', 'Kuhinja', 'TV', 'Parking'],
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
    }
  ];

  constructor(
    private apartmentService: ApartmentService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadApartments();
  }

  private loadApartments(): void {
    // Transform mock data to card format
    this.apartments = this.mockApartments.map(apartment => 
      this.apartmentService.transformToCardData(apartment)
    );
    this.isLoading = false;
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.mockApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, false);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'book') {
          this.onBookApartment(result.apartment);
        }
      });
    }
  }

  private onBookApartment(apartment: Apartment): void {
    console.log('Book apartment:', apartment);
    // TODO: Implement booking functionality
  }

  trackByApartmentId(index: number, apartment: ApartmentCardData): number {
    return apartment.id;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApartmentCardComponent, Apartment } from '../../shared/apartment-card/apartment-card';

@Component({
  selector: 'app-apartments',
  imports: [CommonModule, ApartmentCardComponent],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css'
})
export class Apartments {
  apartments: Apartment[] = [
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
    }
    // More apartments...
  ];

  onViewApartment(apartment: Apartment): void {
    console.log('View apartment:', apartment);
    // Navigate to apartment details
  }

  onEditApartment(apartment: Apartment): void {
    console.log('Edit apartment:', apartment);
    // Open edit dialog or navigate to edit page
  }

  onDeleteApartment(apartment: Apartment): void {
    console.log('Delete apartment:', apartment);
    // Show confirmation dialog and delete
  }
}

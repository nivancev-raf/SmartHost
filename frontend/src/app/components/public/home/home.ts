import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HeroSectionComponent } from '../../layout/hero-section/hero-section';
import { ApartmentCardComponent, Apartment } from '../../shared/apartment-card/apartment-card';

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
export class Home {
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
      amenities: ['Wi-Fi', 'Klima', 'Kuhinja',],
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

  onViewApartment(apartment: Apartment): void {
    console.log('View apartment:', apartment);
    // TODO: Navigate to apartment details page
  }
}

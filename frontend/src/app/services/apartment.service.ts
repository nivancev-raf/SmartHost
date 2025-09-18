import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Apartment, ApartmentCardData, ApartmentStatus } from '../models/apartment';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Get all apartments
  getApartments(): Observable<ApartmentCardData[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments`)
      .pipe(
        map(apartments => apartments.map(apt => this.transformToCardData(apt)))
      );
  }

  // Get apartment by ID
  getApartment(id: number): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.API_URL}/apartments/${id}`);
  }

  // Get apartments by status
  getApartmentsByStatus(status: ApartmentStatus): Observable<ApartmentCardData[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments?status=${status}`)
      .pipe(
        map(apartments => apartments.map(apt => this.transformToCardData(apt)))
      );
  }

  // Transform backend apartment data to card display format
  public transformToCardData(apartment: Apartment): ApartmentCardData {
    // Get primary image or fallback to placeholder
    const primaryImage = apartment.images?.find(img => img.isPrimary);
    const imageUrl = primaryImage?.imageUrl || this.getPlaceholderImage();

    // Calculate average rating (you'll need to implement this based on reviews)
    const rating = this.calculateAverageRating(apartment);

    // Default amenities - you can extend this based on apartment features
    const amenities = this.getDefaultAmenities(apartment);

    return {
      id: apartment.id,
      name: apartment.name,
      location: apartment.city,
      rating: rating,
      guests: apartment.maxGuests || 1,
      price: Number(apartment.basePrice),
      currency: '€', 
      imageUrl: imageUrl,
      amenities: amenities,
      description: apartment.description
    };
  }

  // Calculate average rating from reviews (placeholder implementation)
  private calculateAverageRating(apartment: Apartment): number {
    // TODO: Implement based on your review system
    // For now, return a random rating between 4.0 and 5.0
    return Math.round((4.0 + Math.random()) * 10) / 10;
  }

  // Get default amenities based on apartment features
  private getDefaultAmenities(apartment: Apartment): string[] {
    // If amenities are provided from backend, use them
    if (apartment.amenities && apartment.amenities.length > 0) {
      return apartment.amenities.slice(0, 3); // Limit to 3 for display
    }

    // Otherwise, generate based on apartment features
    const amenities: string[] = ['Wi-Fi']; // Default amenity

    if (apartment.bedrooms && apartment.bedrooms > 0) {
      amenities.push('Kuhinja');
    }
    
    if (apartment.sizeM2 && apartment.sizeM2 > 50) {
      amenities.push('Klima');
    }

    if (apartment.floor && apartment.floor > 3) {
      amenities.push('Pogled');
    }

    // Add more amenities based on apartment features
    if (apartment.bathrooms && apartment.bathrooms > 1) {
      amenities.push('Parking');
    }

    return amenities.slice(0, 3); // Limit to 3 amenities for display
  }

  // Get placeholder image URL
  private getPlaceholderImage(): string {
    const placeholders = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=250&fit=crop'
    ];
    
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  // Admin methods
  createApartment(apartment: Partial<Apartment>): Observable<Apartment> {
    return this.http.post<Apartment>(`${this.API_URL}/apartments`, apartment);
  }

  updateApartment(id: number, apartment: Partial<Apartment>): Observable<Apartment> {
    return this.http.put<Apartment>(`${this.API_URL}/apartments/${id}`, apartment);
  }

  deleteApartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/apartments/${id}`);
  }
}

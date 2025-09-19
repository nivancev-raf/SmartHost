import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { 
  Apartment, 
  ApartmentCardData, 
  ApartmentStatus, 
  CreateApartmentRequest, 
  UpdateApartmentRequest,
  AmenityDto 
} from '../models/apartment';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAllApartments(): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments`);
  }

  getApartmentById(id: number): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.API_URL}/apartments/${id}`);
  }

  createApartment(request: CreateApartmentRequest): Observable<Apartment> {
    return this.http.post<Apartment>(`${this.API_URL}/apartments`, request);
  }

  updateApartment(id: number, request: UpdateApartmentRequest): Observable<Apartment> {
    return this.http.put<Apartment>(`${this.API_URL}/apartments/${id}`, request);
  }

  deleteApartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/apartments/${id}`);
  }

  getApartmentsByOwner(ownerId: number): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments/owner/${ownerId}`);
  }

  getApartmentsByStatus(status: ApartmentStatus): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments?status=${status}`);
  }

  getAllAmenities(): Observable<AmenityDto[]> {
    return this.http.get<AmenityDto[]>(`${this.API_URL}/amenities`);
  }

  getApartments(): Observable<ApartmentCardData[]> {
    return this.getAllApartments().pipe(
      map(apartments => apartments.map(apt => this.transformToCardData(apt)))
    );
  }

  getApartmentsByStatusAsCards(status: ApartmentStatus): Observable<ApartmentCardData[]> {
    return this.getApartmentsByStatus(status).pipe(
      map(apartments => apartments.map(apt => this.transformToCardData(apt)))
    );
  }

    public transformToCardData(apartment: Apartment): ApartmentCardData {
    const primaryImage = apartment.images?.find(img => img.isFeatured);
    const imageUrl = primaryImage?.url || this.getPlaceholderImage();

    const rating = this.calculateAverageRating(apartment);

    // Extract amenity names from AmenityDto objects for display (limit to 3)
    const amenities = apartment.amenities?.slice(0, 3) || [];

    return {
        id: apartment.id,
        name: apartment.name,
        location: `${apartment.city}, ${apartment.address}`,
        price: Number(apartment.basePrice),
        currency: '€',
        rating: rating,
        guests: apartment.maxGuests || 1,
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

  // Image upload methods
  uploadApartmentImages(apartmentId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/apartments/${apartmentId}/images`, formData);
  }

  // Availability check method
  checkAvailability(apartmentId: number, checkin: Date, checkout: Date): Observable<boolean> {
    const params = {
      apartmentId: apartmentId.toString(),
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0]
    };

    return this.http.get<boolean>(`${this.API_URL}/apartments/check-availability`, { params });
  }

  // Booking method
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/bookings`, bookingData);
  }
}
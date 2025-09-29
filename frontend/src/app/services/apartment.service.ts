import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, timeout, catchError, throwError } from 'rxjs';
import { 
  Apartment, 
  ApartmentCardData, 
  ApartmentStatus, 
  CreateApartmentRequest, 
  UpdateApartmentRequest,
  AmenityDto,
  ApartmentImage 
} from '../models/apartment';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  getAllApartments(): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments`);
  }

  getApartmentById(id: number): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.API_URL}/apartments/${id}`);
  }

  createApartment(request: CreateApartmentRequest): Observable<Apartment> {
    const headers = this.getAuthHeaders();
    return this.http.post<Apartment>(`${this.API_URL}/apartments`, request, { headers });
  }

  updateApartment(id: number, request: UpdateApartmentRequest): Observable<Apartment> {
    const headers = this.getAuthHeaders();
    return this.http.put<Apartment>(`${this.API_URL}/apartments/${id}`, request, { headers });
  }

  deleteApartment(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.API_URL}/apartments/${id}`, { headers });
  }

  getApartmentsByOwner(ownerId: number): Observable<Apartment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments/owner/${ownerId}`, { headers });
  }

  getApartmentsByStatus(status: ApartmentStatus): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments?status=${status}`);
  }

  getAllAmenities(): Observable<AmenityDto[]> {
    return this.http.get<AmenityDto[]>(`${this.API_URL}/amenities`);
  }

  getAmenitiesByApartmentId(apartmentId: number): Observable<AmenityDto[]> {
    return this.http.get<AmenityDto[]>(`${this.API_URL}/amenities/${apartmentId}`);
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
    let primaryImage = apartment.images?.find(img => img.featured);
    if (!primaryImage && apartment.images?.length > 0) {
      primaryImage = apartment.images[0];
    }
    let imageUrl = primaryImage?.url;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${this.API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    imageUrl = imageUrl || this.getPlaceholderImage();
    
    const rating = this.calculateAverageRating(apartment);
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

  uploadApartmentImages(apartmentId: number, formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API_URL}/apartments/${apartmentId}/images`, formData, { headers });
  }

  deleteApartmentImage(imageId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.API_URL}/apartments/images/${imageId}`, { headers });
  }

  setFeaturedImage(apartmentId: number, imageId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.API_URL}/apartments/${apartmentId}/images/${imageId}/featured`, {}, { headers });
  }

  getAvailableApartments(checkIn: Date, checkOut: Date, guests?: number, apartmentId?: number): Observable<Apartment[]> {
    const params: any = {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0]
    };
    
    if (guests) {
      params.guests = guests.toString();
    }
    
    if (apartmentId) {
      params.apartmentId = apartmentId.toString();
    }
    
    return this.http.get<Apartment[]>(`${this.API_URL}/apartments/available`, { params });
  }

  // Booking method
  createBooking(bookingData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API_URL}/bookings`, bookingData, { headers });
  }
}
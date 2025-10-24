import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review, CreateReviewRequest, ReviewResponse, PendingReviewReservation } from '../models/review';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/reviews';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all reviews for an apartment (public access)
  getApartmentReviews(apartmentId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/apartment/${apartmentId}`);
  }

  // Get all reviews (admin access)
  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}`);
  }

  // Get reviews by current client
  getMyReviews(): Observable<ReviewResponse[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // If no current user available, return empty list
      return of([]);
    }

    // Backend endpoint is /reviews/client/{clientId}
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/client/${currentUser.id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get pending reservations that can be reviewed by current client
  // Backend returns reservations without review in the shape:
  // [{ reservationId, apartmentId, checkIn, checkOut, guestInformation }]
  // We map that to PendingReviewReservation expected by the frontend.
  getPendingReviews(): Observable<PendingReviewReservation[]> {
    // Note: backend route is /reviews/unreviewed
    return this.http.get<any[]>(`${this.apiUrl}/unreviewed`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((items: any[]) => items.map(item => ({
        id: item.reservationId,
        apartmentId: item.apartmentId,
        apartmentName: item.apartmentName || this.getApartmentName(item.apartmentId),
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        reviewSubmitted: false
      }) as PendingReviewReservation))
    );
  }

  // Create a new review (client access)
  createReview(reviewRequest: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}`, reviewRequest, {
      headers: this.getAuthHeaders()
    });
  }

  private getApartmentName(apartmentId: number): string {
    const apartmentNames: { [key: number]: string } = {
      1: "Modern Downtown Loft",
      2: "Luxury City Center Suite", 
      3: "Cozy Garden Apartment"
    };
    return apartmentNames[apartmentId] || `Apartment #${apartmentId}`;
  }

  // Update a review (client access - only their own reviews)
  updateReview(reviewId: number, reviewRequest: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.apiUrl}/${reviewId}`, reviewRequest, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete a review (admin access or client's own review)
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get review by reservation ID
  getReviewByReservation(reservationId: number): Observable<ReviewResponse | null> {
    return this.http.get<ReviewResponse | null>(`${this.apiUrl}/reservation/${reservationId}`, {
      headers: this.getAuthHeaders()
    });
  }

  
}
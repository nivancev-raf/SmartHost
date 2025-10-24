export interface Review {
  id: number;
  reservationId: number;
  apartmentId: number;
  clientId: number;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: string;
  
  // Related data (populated by backend)
  reservation?: {
    id: number;
    checkIn: string;
    checkOut: string;
    guestInformation: {
      firstName: string;
      lastName: string;
    };
  };
  apartment?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateReviewRequest {
  reservationId: number;
  apartmentId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse extends Review {
  // Additional response fields if needed
}

export interface PendingReviewReservation {
  id: number;
  apartmentId: number;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  reviewSubmitted: boolean;
}
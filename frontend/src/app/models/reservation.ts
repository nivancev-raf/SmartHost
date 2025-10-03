export interface GuestInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ReservationRequest {
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  specialRequest?: string;
  guestInformation: GuestInformation;
}

export interface ReservationResponse {
  id: number;
  clientId?: number | null;
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  accessCode: string;
  specialRequest?: string;
  createdAt: string;
  guestInformation: GuestInformation;
  checkoutUrl?: string; // Backend provides this for PENDING reservations
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

import { User } from './auth';

export enum ApartmentStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED', 
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface ApartmentImage {
  id: number;
  apartmentId: number;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Apartment {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  sizeM2?: number;
  basePrice: number;
  status: ApartmentStatus;
  createdAt: string;
  
  // New amenities field
  amenities?: string[];
  
  // Relationships
  owner?: User;
  images?: ApartmentImage[];
  
  // Additional frontend properties for display
  rating?: number;
  currency?: string;
}

// DTO for apartment card display - maps backend data to card-friendly format
export interface ApartmentCardData {
  id: number;
  name: string;
  location: string; // maps to city
  rating: number;
  guests: number; // maps to maxGuests
  price: number; // maps to basePrice
  currency: string;
  imageUrl: string; // primary image from images array
  amenities: string[];
  description?: string;
}

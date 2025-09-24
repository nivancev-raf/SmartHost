import { User } from './auth';

export enum ApartmentStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',     
  CLEANING = 'CLEANING'  
}

export interface ApartmentImage {
  id: number;
  apartmentId: number;
  url: string;
  featured: boolean;
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
  amenities: AmenityDto[];
  owner?: User;
  images: ApartmentImage[];
  rating?: number;
  currency?: string;
}

export interface ApartmentCardData {
  id: number;
  name: string;
  location: string; // maps to city
  rating: number;
  guests: number; // maps to maxGuests
  price: number; // maps to basePrice
  currency: string;
  imageUrl: string; // primary image from images array
  amenities: AmenityDto[];
  description?: string;
}

export interface UpdateApartmentRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeM2?: number;
  basePrice: number;
  status?: ApartmentStatus;
  amenityIds?: number[];
}

export interface CreateApartmentRequest {
  ownerId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeM2?: number;
  basePrice: number;
  amenityIds?: number[]; 
}


export interface AmenityDto {
  id: number;
  name: string;
}

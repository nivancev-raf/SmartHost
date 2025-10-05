import { Injectable } from '@angular/core';
import { ReservationResponse } from '../models/reservation';

export type ReservationDisplayStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

@Injectable({
  providedIn: 'root'
})
export class ReservationUtils {

  // Status-related methods
  getDisplayStatus(reservation: ReservationResponse): ReservationDisplayStatus {
    const today = this.getTodayDate();
    const checkInDate = this.getDateOnly(reservation.checkIn);
    const checkOutDate = this.getDateOnly(reservation.checkOut);
    
    if (checkOutDate < today) {
      return 'COMPLETED';
    } else if (checkInDate <= today && checkOutDate >= today) {
      return 'ACTIVE';
    } else {
      return 'UPCOMING';
    }
  }

  getDisplayStatusIcon(reservation: ReservationResponse): string {
    const statusIcons: Record<ReservationDisplayStatus, string> = {
      'COMPLETED': 'done_all',
      'ACTIVE': 'hotel',
      'UPCOMING': 'schedule'
    };
    return statusIcons[this.getDisplayStatus(reservation)];
  }

  getDisplayStatusClass(reservation: ReservationResponse): string {
    return `status-${this.getDisplayStatus(reservation).toLowerCase()}`;
  }

  // Formatting methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Statistics methods
  getActiveReservations(reservations: ReservationResponse[]): number {
    return reservations.filter(r => this.getDisplayStatus(r) !== 'COMPLETED').length;
  }

  getCompletedReservations(reservations: ReservationResponse[]): number {
    return reservations.filter(r => this.getDisplayStatus(r) === 'COMPLETED').length;
  }

  getTotalRevenue(reservations: ReservationResponse[]): number {
    return reservations
      .filter(r => this.getDisplayStatus(r) === 'COMPLETED')
      .reduce((total, r) => total + r.totalPrice, 0);
  }

  // Sorting methods
  sortReservations(reservations: ReservationResponse[]): ReservationResponse[] {
    return reservations.sort((a, b) => {
      const aOrder = this.getReservationSortOrder(a);
      const bOrder = this.getReservationSortOrder(b);
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Within same status, sort by check-in date
      const aCheckIn = new Date(a.checkIn);
      const bCheckIn = new Date(b.checkIn);
      
      // For completed: most recent first, for others: earliest first
      return aOrder === 3 ? bCheckIn.getTime() - aCheckIn.getTime() : aCheckIn.getTime() - bCheckIn.getTime();
    });
  }

  private getReservationSortOrder(reservation: ReservationResponse): number {
    const statusOrder: Record<ReservationDisplayStatus, number> = {
      'UPCOMING': 1,
      'ACTIVE': 2,
      'COMPLETED': 3
    };
    return statusOrder[this.getDisplayStatus(reservation)] || 4;
  }

  // Utility methods
  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getDateOnly(dateString: string): Date {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

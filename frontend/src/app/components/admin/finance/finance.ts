import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApartmentService } from '../../../services/apartment.service';
import { User } from '../../../models/auth';
import { ReservationResponse } from '../../../models/reservation';
import { Apartment } from '../../../models/apartment';

interface IncomeData {
  apartmentId: number;
  apartmentName: string;
  daily: number;
  monthly: number;
  annual: number;
  currency: string;
}

interface FinanceSummary {
  totalDaily: number;
  totalMonthly: number;
  totalAnnual: number;
  currency: string;
  apartmentCount: number;
}

@Component({
  selector: 'app-finance',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTableModule
  ],
  templateUrl: './finance.html',
  styleUrl: './finance.css'
})
export class Finance implements OnInit, OnDestroy {
  // Public properties
  currentUser: User | null = null;
  isLoading = false;
  apartments: Apartment[] = [];
  reservations: ReservationResponse[] = [];
  incomeData: IncomeData[] = [];
  financeSummary: FinanceSummary = {
    totalDaily: 0,
    totalMonthly: 0,
    totalAnnual: 0,
    currency: 'EUR',
    apartmentCount: 0
  };

  // Table configuration
  displayedColumns: string[] = ['apartment', 'daily', 'monthly', 'annual'];
  
  // Private properties
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.initializeAuthSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Private methods - Auth and Data Loading
  private initializeAuthSubscription(): void {
    const authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user?.role === 'ADMIN' && user.id) {
        this.loadFinanceData();
      }
    });
    
    this.subscriptions.push(authSubscription);
  }

  private loadFinanceData(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;
    this.loadApartments();
    this.loadReservations();
  }

  private loadApartments(): void {
    if (!this.currentUser?.id) return;

    const apartmentSubscription = this.apartmentService.getApartmentsByOwner(this.currentUser.id).subscribe({
      next: (apartments: Apartment[]) => {
        this.apartments = apartments;
        this.calculateIncomeData();
      },
      error: (error: any) => {
        this.handleError('Failed to load apartments', 'Error loading apartments', error);
      }
    });

    this.subscriptions.push(apartmentSubscription);
  }

  private loadReservations(): void {
    if (!this.currentUser?.id) return;

    const reservationSubscription = this.apartmentService.getOwnerReservations(this.currentUser.id).subscribe({
      next: (reservations: ReservationResponse[]) => {
        this.reservations = reservations.filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED');
        this.calculateIncomeData();
      },
      error: (error: any) => {
        this.handleError('Failed to load reservations', 'Error loading reservations', error);
      }
    });

    this.subscriptions.push(reservationSubscription);
  }

  private calculateIncomeData(): void {
    if (this.apartments.length === 0 || this.reservations.length === 0) {
      this.finishLoading();
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    this.incomeData = this.apartments.map(apartment => {
      const apartmentReservations = this.reservations.filter(r => r.apartmentId === apartment.id);
      
      // Calculate daily income (today)
      const dailyIncome = apartmentReservations
        .filter(r => this.isDateInRange(r.checkIn, r.checkOut, today))
        .reduce((sum, r) => sum + r.totalPrice, 0);

      // Calculate monthly income (current month)
      const monthlyIncome = apartmentReservations
        .filter(r => {
          const checkIn = new Date(r.checkIn);
          const checkOut = new Date(r.checkOut);
          return (checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear) ||
                 (checkOut.getMonth() === currentMonth && checkOut.getFullYear() === currentYear) ||
                 (checkIn <= new Date(currentYear, currentMonth, 1) && checkOut >= new Date(currentYear, currentMonth + 1, 0));
        })
        .reduce((sum, r) => sum + r.totalPrice, 0);

      // Calculate annual income (current year)
      const annualIncome = apartmentReservations
        .filter(r => {
          const checkIn = new Date(r.checkIn);
          return checkIn.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + r.totalPrice, 0);

      return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        daily: dailyIncome,
        monthly: monthlyIncome,
        annual: annualIncome,
        currency: apartment.currency || 'EUR'
      };
    });

    this.calculateSummary();
    this.finishLoading();
  }

  private calculateSummary(): void {
    this.financeSummary = {
      totalDaily: this.incomeData.reduce((sum, item) => sum + item.daily, 0), // 0 in reduce means initial value
      totalMonthly: this.incomeData.reduce((sum, item) => sum + item.monthly, 0),
      totalAnnual: this.incomeData.reduce((sum, item) => sum + item.annual, 0),
      currency: this.incomeData[0]?.currency || 'EUR',
      apartmentCount: this.apartments.length
    };
  }

  private isDateInRange(checkIn: string, checkOut: string, targetDate: Date): boolean {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    return checkInDate <= target && checkOutDate >= target;
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private handleError(userMessage: string, logMessage: string, error?: any): void {
    console.error(logMessage, error);
    this.snackBar.open(userMessage, 'Close', { duration: 3000 });
    this.finishLoading();
  }

  // Public utility methods
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

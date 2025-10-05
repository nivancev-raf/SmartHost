import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { Apartment } from '../../../../models/apartment';
import { ReservationResponse } from '../../../../models/reservation';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isBooked: boolean;
  reservations: ReservationResponse[];
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  days: CalendarDay[];
}

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.css']
})
export class CalendarDialogComponent implements OnInit {
  apartment!: Apartment;
  reservations!: ReservationResponse[];
  
  currentMonth: Date = new Date();
  monthData: MonthData = { year: 0, month: 0, monthName: '', days: [] };
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    public dialogRef: MatDialogRef<CalendarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { apartment: Apartment; reservations: ReservationResponse[] }
  ) {
    this.apartment = data.apartment;
    this.reservations = data.reservations;
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate only days for the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      
      const dayReservations = this.getReservationsForDate(date);
      const isBooked = dayReservations.length > 0;
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isBooked: isBooked,
        reservations: dayReservations
      });
    }

    this.monthData = {
      year,
      month,
      monthName: this.monthNames[month],
      days
    };
  }

  private getReservationsForDate(date: Date): ReservationResponse[] {
    return this.reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      // Include check-in date but exclude check-out date
      return date >= checkIn && date < checkOut;
    });
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  getDayTooltip(day: CalendarDay): string {
    if (!day.isBooked) {
      return 'Available';
    }

    const reservationInfo = day.reservations.map(r => {
      const checkIn = new Date(r.checkIn).toLocaleDateString();
      const checkOut = new Date(r.checkOut).toLocaleDateString();
      return `${checkIn} - ${checkOut}`;
    }).join('\n');

    return `Booked:\n${reservationInfo}`;
  }

  getDayClass(day: CalendarDay): string {
    let classes = ['calendar-day'];
    
    if (day.isToday) classes.push('today');
    if (day.isBooked) classes.push('booked');
    else classes.push('available');
    
    return classes.join(' ');
  }

  close(): void {
    this.dialogRef.close();
  }
}

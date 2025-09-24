import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../../layout/hero-section/hero-section';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';
import { ApartmentCardData, Apartment, AmenityDto } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButtonModule,
    HeroSectionComponent,
    ApartmentCardComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  apartments: ApartmentCardData[] = [];
  private allApartments: Apartment[] = []; // Store full data for dialog

  constructor(
    private apartmentService: ApartmentService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedApartments();
  }

  private loadFeaturedApartments(): void {
    this.apartmentService.getAllApartments().subscribe({
      next: (apartments) => {
        // Store all apartments for dialog details
        this.allApartments = apartments.filter(apt => apt.status === 'AVAILABLE');
        // Show only first 6 for featured display on home page
        this.apartments = this.allApartments
          .slice(0, 6)
          .map(apt => this.apartmentService.transformToCardData(apt));
      },
      error: (error) => {
        console.error('Error loading apartments:', error);
        // Fallback - show empty array if API fails
        this.apartments = [];
        this.allApartments = [];
      }
    });
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.allApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, false);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'book') {
          this.onBookApartment(result.apartment);
        }
      });
    }
  }

  // Navigate to full apartments catalog
  onViewAllApartments(): void {
    this.router.navigate(['/apartments']);
  }

  // Handle search from hero section
  onSearchApartments(searchData: any): void {
    // Navigate to apartments page with search parameters
    this.router.navigate(['/apartments'], {
      queryParams: {
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
        location: searchData.location
      }
    });
  }

  private onBookApartment(apartment: Apartment): void {
    console.log('Book apartment:', apartment);
    // TODO: Navigate to booking page or open booking dialog
    // this.router.navigate(['/booking'], { queryParams: { apartmentId: apartment.id } });
  }
}

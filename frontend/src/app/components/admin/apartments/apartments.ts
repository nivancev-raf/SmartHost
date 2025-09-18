import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApartmentCardComponent } from '../../shared/apartment-card/apartment-card';
import { Apartment, ApartmentCardData, ApartmentStatus } from '../../../models/apartment';
import { ApartmentService } from '../../../services/apartment.service';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-apartments',
  imports: [CommonModule, ApartmentCardComponent, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css'
})
export class Apartments implements OnInit, OnDestroy {
  apartments: ApartmentCardData[] = [];
  adminName: string = '';
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  // Mock data - in real app this would come from API
  private mockApartments: Apartment[] = [
    {
      id: 1,
      ownerId: 1,
      name: 'Aqua View Studio',
      description: 'Modern studio with beautiful city views',
      address: 'Knez Mihailova 12',
      city: 'Beograd',
      floor: 3,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      sizeM2: 45,
      basePrice: 55,
      status: ApartmentStatus.AVAILABLE,
      createdAt: new Date().toISOString(),
      amenities: ['Wi-Fi', 'Klima', 'Kuhinja'],
      rating: 4.8,
      currency: '€',
      images: [
        {
          id: 1,
          apartmentId: 1,
          imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
          isPrimary: true,
          createdAt: new Date().toISOString()
        }
      ]
    }
    // More apartments...
  ];

  constructor(
    private apartmentService: ApartmentService, 
    private authService: AuthService, 
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
    this.loadApartments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAdminData(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.adminName = user.firstName ? `${user.firstName} ${user.lastName}` : user.email;
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  private loadApartments(): void {
    // Transform mock data to card format
    this.apartments = this.mockApartments.map(apartment => 
      this.apartmentService.transformToCardData(apartment)
    );
    this.isLoading = false;
  }

  onAddApartment(): void {
    console.log('Add new apartment');
    // TODO: Open add apartment dialog or navigate to add form
  }

  trackByApartmentId(index: number, apartment: ApartmentCardData): number {
    return apartment.id;
  }

  onViewApartment(apartment: ApartmentCardData): void {
    // Find the full apartment data for the dialog
    const fullApartment = this.mockApartments.find(apt => apt.id === apartment.id);
    if (fullApartment) {
      const dialogRef = this.dialogService.openApartmentDetailsDialog(fullApartment, true);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'edit') {
          this.onEditApartment(apartment);
        } else if (result?.action === 'delete') {
          this.onDeleteApartment(apartment);
        }
      });
    }
  }

  onEditApartment(apartment: ApartmentCardData): void {
    console.log('Edit apartment:', apartment);
    // Open edit dialog or navigate to edit page
  }

  onDeleteApartment(apartment: ApartmentCardData): void {
    console.log('Delete apartment:', apartment);
    // Show confirmation dialog and delete
  }
}

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';
import { Subscription } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [
    MatToolbarModule, 
    MatButtonModule,
    CommonModule, 
    MatIconModule, 
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isLoggedIn = false;
  userRole = 'GUEST';
  currentUser: any = null;
  isScrolled = false;

  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.subscriptions.add(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      })
    );

    this.subscriptions.add(
      this.authService.userRole$.subscribe(role => {
        this.userRole = role;
      })
    );

    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 80; // Change background after scrolling 80px
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isMobileMenuOpen = false;
  }

  openLoginDialog(): void {
    this.dialogService.openLoginDialog();
    this.isMobileMenuOpen = false;
  }

  openRegisterDialog(): void {
    this.dialogService.openRegisterDialog();
    this.isMobileMenuOpen = false;
  }

  // Navigation items based on user role
  get navigationItems() {
    if (this.authService.isAdmin()) {
      return [
        { path: '/admin/apartments', label: 'Properties', icon: 'apartment' },
        { path: '/admin/reservations', label: 'Reservations', icon: 'book' },
        { path: '/admin/calendar', label: 'Calendar', icon: 'calendar_today' },
        { path: '/admin/finance', label: 'Finance', icon: 'attach_money' }
      ];
    }

    // Guest & Client navigation
    return [
      { path: '/apartments', label: 'Our Accommodations', icon: 'apartment' },
      { path: '/reservations', label: 'Reservations', icon: 'book' },
      { path: '/contact', label: 'Contact', icon: 'contact_mail' },
      { path: '/about', label: 'More...', icon: 'more_horiz' }
    ];
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  // Handle navigation click
  onNavigate(path: string): void {
    this.router.navigate([path]);
    this.isMobileMenuOpen = false;
  }

  // Get user display name
  get userDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return '';
  }

  // Get user initials for avatar
  get userInitials(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`;
    }
    return '';
  }
}
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [
    MatToolbarModule, 
    MatButtonModule,
    CommonModule, 
    MatIconModule, 
    MatMenuModule,
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHeroVisible = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  userRole = 'GUEST';
  currentUser: any = null;

  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
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

    // Check if we're on home page to show transparent header
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.isHeroVisible = event.url === '/' || event.url === '/home';
      })
    );

    // Initial check
    this.isHeroVisible = this.router.url === '/' || this.router.url === '/home';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrolled = window.pageYOffset;
    if (this.isHeroVisible) {
      // Make header opaque when scrolling past hero section
      this.isHeroVisible = scrolled < window.innerHeight * 0.8;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
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

  // Check if current route is active
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
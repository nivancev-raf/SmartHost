import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  private currentUserId: number | null = null;

  // Observable streams
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.tokenExists());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());
  userRole$ = this.userRoleSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load current user if token exists
    if (this.tokenExists()) {
      this.loadCurrentUser();
    }
  }

  tokenExists(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  private getUserRole(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'GUEST';
    }
    return localStorage.getItem('userRole') || 'GUEST';
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post<LoginResponse>(
        `${this.API_URL}/auth/login`,
        { email, password },
        { 
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }
      ).toPromise();

      if (response && response.token && response.user) {
        // Store auth data (only on client side)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.user.role);
          localStorage.setItem('userId', response.user.id.toString());
          localStorage.setItem('userData', JSON.stringify(response.user));
        }

        // Update subjects
        this.isLoggedInSubject.next(true);
        this.userRoleSubject.next(response.user.role);
        this.currentUserSubject.next(response.user);
        this.currentUserId = response.user.id;

        // Redirect based on role
        this.redirectAfterLogin(response.user.role);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      this.handleLoginError(error);
    }
  }

  async register(userData: any): Promise<void> {
    try {
      const response = await this.http.post<LoginResponse>(
        `${this.API_URL}/auth/register`,
        userData,
        { 
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }
      ).toPromise();

      if (response && response.token && response.user) {
        // Auto-login after registration
        await this.setAuthData(response.token, response.user);
      }
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private async setAuthData(token: string, user: User): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('userData', JSON.stringify(user));
    }

    this.isLoggedInSubject.next(true);
    this.userRoleSubject.next(user.role);
    this.currentUserSubject.next(user);
    this.currentUserId = user.id;

    this.redirectAfterLogin(user.role);
  }

  private redirectAfterLogin(role: string): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT':
        this.router.navigate(['/apartments']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
    }

    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next('GUEST');
    this.currentUserSubject.next(null);
    this.currentUserId = null;

    this.router.navigate(['/']);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.tokenExists()) {
      return null;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${this.getToken()}`
      };

      const response = await this.http.get<User>(
        `${this.API_URL}/auth/current-user`,
        { headers }
      ).toPromise();

      if (response && response.id) {
        this.currentUserId = response.id;
        this.currentUserSubject.next(response);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userData', JSON.stringify(response));
        }
      }

      return response || null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.logout(); // Token might be invalid
      return null;
    }
  }

  private async loadCurrentUser(): Promise<void> {
    // Try to load from localStorage first (only on client side)
    if (isPlatformBrowser(this.platformId)) {
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        try {
          const user = JSON.parse(savedUserData);
          this.currentUserSubject.next(user);
          this.currentUserId = user.id;
        } catch (e) {
          console.error('Error parsing saved user data');
        }
      }
    }

    // Then fetch fresh data from server
    await this.getCurrentUser();
  }

  getCurrentUserId(): number | null {
    if (this.currentUserId) return this.currentUserId;
    if (!isPlatformBrowser(this.platformId)) return null;
    const savedId = localStorage.getItem('userId');
    return savedId ? parseInt(savedId) : null;
  }

  getCurrentUserRole(): string {
    return this.getUserRole();
  }

  // Role checking methods
  isGuest(): boolean {
    return this.getCurrentUserRole() === 'GUEST' || !this.tokenExists();
  }

  isClient(): boolean {
    return this.getCurrentUserRole() === 'CLIENT';
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  // Check if user can access certain features
  canCreateReview(): boolean {
    return this.isClient();
  }

  canManageProperties(): boolean {
    return this.isAdmin();
  }

  canViewBookingHistory(): boolean {
    return this.isClient() || this.isAdmin();
  }

  private handleLoginError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 401:
          throw new Error('Invalid email or password');
        case 403:
          throw new Error('Account is disabled');
        case 0:
          throw new Error('Unable to connect to server');
        default:
          throw new Error('Login failed. Please try again.');
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  private handleAuthError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          throw new Error('Invalid registration data');
        case 409:
          throw new Error('Email already exists');
        case 0:
          throw new Error('Unable to connect to server');
        default:
          throw new Error('Registration failed. Please try again.');
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
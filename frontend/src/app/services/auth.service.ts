import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginResponse, User, RegisterRequest } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080';
  private currentUserId: number | null = null;

  // Observable streams - Initialize with proper initial values
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>('GUEST');
  userRole$ = this.userRoleSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize authentication state on startup
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const savedUserData = localStorage.getItem('userData');
      
      if (token && savedUserData && this.isTokenValid(token)) {
        try {
          const user = JSON.parse(savedUserData);
          // Update all subjects with persisted state
          this.isLoggedInSubject.next(true);
          this.userRoleSubject.next(user.role || 'GUEST');
          this.currentUserSubject.next(user);
          this.currentUserId = user.id;
          
          console.log('Auth state restored from localStorage:', {
            isLoggedIn: true,
            role: user.role,
            user: user
          });
        } catch (e) {
          console.error('Error parsing saved user data, clearing localStorage');
          this.clearAuthData();
        }
      } else {
        // No valid auth data or token expired, ensure clean state
        console.log('No valid auth data found, clearing state');
        this.clearAuthData();
      }
    }
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next('GUEST');
    this.currentUserSubject.next(null);
    this.currentUserId = null;
  }

  tokenExists(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token && this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      // Basic token format check
      if (!token || token.split('.').length !== 3) {
        return false;
      }
      
      // Decode JWT payload to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token has expired');
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Invalid token format:', e);
      return false;
    }
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
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role || 'GUEST';
      } catch (e) {
        return 'GUEST';
      }
    }
    return 'GUEST';
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

      console.log('Login response:', response);

      if (response && response.token && response.user) {
        // Store auth data (only on client side)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
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

  async register(userData: RegisterRequest): Promise<void> {
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
    this.clearAuthData();
    this.router.navigate(['/']);
  }


  isAdmin(): boolean {
    return this.userRoleSubject.value === 'ADMIN';
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
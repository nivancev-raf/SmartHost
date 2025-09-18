import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Check if user is logged in and has admin role
    if (this.authService.tokenExists() && this.authService.isAdmin()) {
      return true;
    }

    // Redirect to home if not admin
    this.router.navigate(['/']);
    return false;
  }
}

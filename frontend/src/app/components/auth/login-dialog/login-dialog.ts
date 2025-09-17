import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.html',
  styleUrls: ['./login-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class LoginDialogComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<LoginDialogComponent>
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      try {
        await this.authService.login(email, password);
        this.isLoading = false;
        this.dialogRef.close();
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onRegisterClick(): void {
    this.dialogRef.close({ openRegister: true });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }
}

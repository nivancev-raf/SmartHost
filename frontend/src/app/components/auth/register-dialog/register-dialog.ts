import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.html',
  styleUrls: ['./register-dialog.css'],
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
export class RegisterDialogComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = { ...this.registerForm.value };
      delete userData.confirmPassword; // Remove confirm password before sending
      
      try {
        await this.authService.register(userData);
        this.isLoading = false;
        this.dialogRef.close({ success: true });
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  onLoginClick(): void {
    this.dialogRef.close({ success: false, openLogin: true });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('pattern') && field === 'phone') {
      return 'Please enter a valid phone number';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}

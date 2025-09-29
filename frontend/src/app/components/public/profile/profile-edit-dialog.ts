import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../../models/auth';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile-edit-dialog.html',
  styleUrl: './profile-edit-dialog.css'
})
export class ProfileEditDialog implements OnInit {
  profileForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProfileEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.data.user.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.data.user.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      phone: [this.data.user.phone, [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      changePassword: [false],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });

    // Add conditional validators for password fields
    this.profileForm.get('changePassword')?.valueChanges.subscribe(changePassword => {
      const currentPasswordControl = this.profileForm.get('currentPassword');
      const newPasswordControl = this.profileForm.get('newPassword');
      const confirmPasswordControl = this.profileForm.get('confirmPassword');

      if (changePassword) {
        currentPasswordControl?.setValidators([Validators.required]);
        newPasswordControl?.setValidators([Validators.required, Validators.minLength(6)]);
        confirmPasswordControl?.setValidators([Validators.required, this.passwordMatchValidator.bind(this)]);
      } else {
        currentPasswordControl?.clearValidators();
        newPasswordControl?.clearValidators();
        confirmPasswordControl?.clearValidators();
      }

      currentPasswordControl?.updateValueAndValidity();
      newPasswordControl?.updateValueAndValidity();
      confirmPasswordControl?.updateValueAndValidity();
    });

    // Add password match validator
    this.profileForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.profileForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = this.profileForm?.get('newPassword')?.value;
    const confirmPassword = control.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.profileForm.value;
      const updateData: any = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone
      };

      // Add password fields if changing password
      if (formValue.changePassword) {
        updateData.currentPassword = formValue.currentPassword;
        updateData.newPassword = formValue.newPassword;
      }

      // Simulate API call
      setTimeout(() => {
        try {
          console.log('Profile update data:', updateData);
          
          // Update user data in auth service
          const updatedUser: User = {
            ...this.data.user,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            email: updateData.email,
            phone: updateData.phone
          };
          
          this.authService.updateUserData(updatedUser);
          
          this.isSubmitting = false;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          this.dialogRef.close(updatedUser);
        } catch (error) {
          this.isSubmitting = false;
          this.snackBar.open('Failed to update profile. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }, 2000);
    } else {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

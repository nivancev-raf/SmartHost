import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface EmailMessageDto {
  email: string;
  subject: string;
  message: string;
  name: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  private readonly API_URL = 'http://localhost:8080';
  
  heroImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&crop=center';
  contactForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      const emailData: EmailMessageDto = {
        name: this.contactForm.get('name')?.value,
        email: this.contactForm.get('email')?.value,
        subject: this.contactForm.get('subject')?.value,
        message: this.contactForm.get('message')?.value
      };

      this.http.post<{message: string}>(`${this.API_URL}/notifications/sendEmail`, emailData)
        .subscribe({
          next: (response) => {
            console.log('Email sent successfully:', response);
            this.isSubmitting = false;
            this.showSuccessMessage = true;
            this.contactForm.reset();
            this.snackBar.open('Message sent successfully!', 'Close', { 
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 5000);
          },
          error: (error) => {
            console.error('Error sending email:', error);
            this.isSubmitting = false;
            this.snackBar.open('Failed to send message. Please try again.', 'Close', { 
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}

# SmartHost - Apartment Booking Platform

A full-stack web application for managing apartment rentals with automated booking, integrated payment processing, and real-time availability management.

## Features

### Guest Features
- Browse available apartments with detailed information  
- Real-time availability search by date range and guest count  
- Interactive booking calendar  
- Secure payment processing via Stripe  
- Automated booking confirmation emails  
- Access code generation for property entry  
- Responsive design for all devices  

### Property Owner Features
- Apartment management (CRUD operations)  
- Image upload and management via Cloudinary  
- Reservation tracking and management  
- Revenue monitoring  
- Automated booking notifications  
- Guest information access  

### Admin Features
- JWT-based authentication  
- User management (guests and owners)  
- Complete apartment and reservation management  
- System overview and analytics  

## Tech Stack

### Backend
- Java 17 with Spring Boot 3.x  
- Spring Security with JWT authentication  
- Spring Data JPA with MySQL  
- Stripe API for payment processing  
- Cloudinary SDK for image management  
- JavaMailSender for email notifications  
- Stripe CLI for webhook testing  

### Frontend
- Angular 18+  
- Angular Material for UI components  
- TypeScript  
- RxJS for reactive programming  
- Angular Router for navigation  

### Database
- MySQL for production  
- Entities: Users, Apartments, Reservations, GuestInformation, Payments  

---

## Getting Started

1. Clone the repository  
2. Set up the backend (`/backend`) with Java 17 and configure MySQL connection  
3. Set up the frontend (`/frontend`) with Angular CLI  
4. Configure Stripe and Cloudinary credentials in environment files  
5. Run backend and frontend servers  

---

## License

This project is licensed under the MIT License.  

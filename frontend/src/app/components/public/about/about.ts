import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  heroImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&crop=center';

  teamMembers = [
    {
      name: 'Miloš Nivanović',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      description: 'Passionate about hospitality and technology, leading SmartHost to redefine apartment rentals.'
    },
    {
      name: 'Ana Petrović',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c41e8b8e?w=300&h=300&fit=crop&crop=face',
      description: 'Ensures seamless operations and exceptional guest experiences across all properties.'
    },
    {
      name: 'Marko Jovanović',
      role: 'Technology Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      description: 'Drives innovation and maintains our cutting-edge booking platform and smart home systems.'
    }
  ];

  values = [
    {
      icon: 'home',
      title: 'Comfort First',
      description: 'Every apartment is carefully selected and maintained to provide the ultimate comfort for our guests.'
    },
    {
      icon: 'security',
      title: 'Trust & Safety',
      description: 'Your safety and security are our top priorities. All properties are verified and monitored 24/7.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any needs.'
    },
    {
      icon: 'eco',
      title: 'Sustainability',
      description: 'We are committed to sustainable practices and eco-friendly solutions in all our properties.'
    }
  ];
}

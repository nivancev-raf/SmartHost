import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SearchFormComponent} from "../../shared/search-form/search-form";
import { HeroConfig } from "../../../models/hero-config";

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.html',
  imports: [CommonModule, SearchFormComponent],
  styleUrls: ['./hero-section.css']
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() heroTitle = 'Stay Smart, Pay Less';
  @Input() heroSubtitle = 'Direct booking without commission fees - luxury apartments in Belgrade';
  @Input() showSearch = true;

  @Output() searchSubmit = new EventEmitter<any>();

  heroImages: string[] = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&h=1080&fit=crop&crop=center'
  ];

  currentSlide = 0;
  private slideInterval: any;
  private autoSlideEnabled = true; // Track if auto-slide is enabled

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    this.stopSlideShow();
  }

  private startSlideShow(): void {
    if (!this.autoSlideEnabled) return;
    
    this.stopSlideShow(); // Clear any existing interval
    
    this.slideInterval = setInterval(() => {
      if (this.autoSlideEnabled) { // Double check
        this.currentSlide = (this.currentSlide + 1) % this.heroImages.length;
        this.cdr.detectChanges(); // Force change detection
      }
    }, 4000);
  }

  private stopSlideShow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  // Disable auto-slide when user manually navigates
  private disableAutoSlide(): void {
    this.autoSlideEnabled = false;
    this.stopSlideShow();
    
    // Re-enable auto-slide after 10 seconds of inactivity
    setTimeout(() => {
      this.autoSlideEnabled = true;
      this.startSlideShow();
    }, 10000);
  }

  nextSlide(): void {
    this.disableAutoSlide();
    this.currentSlide = (this.currentSlide + 1) % this.heroImages.length;
    this.cdr.detectChanges();
    console.log('Manual next slide to:', this.currentSlide);
  }

  previousSlide(): void {
    this.disableAutoSlide();
    this.currentSlide = this.currentSlide === 0 ? 
      this.heroImages.length - 1 : this.currentSlide - 1;
    this.cdr.detectChanges();
    console.log('Manual previous slide to:', this.currentSlide);
  }

  goToSlide(index: number): void {
    this.disableAutoSlide();
    this.currentSlide = index;
    this.cdr.detectChanges();
    console.log('Manual go to slide:', this.currentSlide);
  }

  onSearch(searchData: any): void {
    this.searchSubmit.emit(searchData);
  }

  updateHeroConfig(config: HeroConfig): void {
    this.heroTitle = config.title;
    this.heroSubtitle = config.subtitle;
    this.showSearch = config.showSearch;
    this.cdr.detectChanges();
  }
}
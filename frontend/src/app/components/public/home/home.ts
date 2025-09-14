import { Component } from '@angular/core';
import { HeroSectionComponent } from '../../layout/hero-section/hero-section';

@Component({
  selector: 'app-home',
  imports: [HeroSectionComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}

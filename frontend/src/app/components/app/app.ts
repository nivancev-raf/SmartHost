import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../layout/header/header";
import { Footer } from "../layout/footer/footer";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('smart-host');

  constructor(private authService: AuthService) {
    // AuthService injection ensures auth state is initialized from localStorage
  }
}

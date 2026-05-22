import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoggedIn$ = this.authService.isLoggedIn$;
  constructor(private authService: AuthService) {}
  get userRole(): string { return this.authService.getUserRole() || ''; }
  get userName(): string { return this.authService.getUserName() || 'Guest'; }
  logout() { this.authService.logout(); }
}

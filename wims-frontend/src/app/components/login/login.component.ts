import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glass-card login-box fade-in-up">
        
        <!-- TABS FOR LOGIN / SIGNUP -->
        <div class="tab-header">
          <button class="tab-btn" [class.active]="activeTab === 'login'" (click)="activeTab = 'login'">Sign In</button>
          <button class="tab-btn" [class.active]="activeTab === 'signup'" (click)="activeTab = 'signup'">Sign Up</button>
        </div>

        <div *ngIf="message" class="alert-msg" [class.success]="isSuccess">{{message}}</div>

        <!-- LOGIN FORM -->
        <div *ngIf="activeTab === 'login'">
          <div class="header">
            <h2>Welcome Back</h2>
            <p>Login to access WIMS Terminal</p>
          </div>
          <form (ngSubmit)="onLogin()">
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="loginCreds.email" name="loginEmail" required placeholder="admin@humancloud.com" autocomplete="email">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="loginCreds.password" name="loginPassword" required placeholder="••••••••" autocomplete="current-password">
            </div>
            <button type="submit" class="btn-glow">Access Terminal</button>
          </form>
        </div>

        <!-- SIGNUP FORM -->
        <div *ngIf="activeTab === 'signup'">
          <div class="header">
            <h2>Create Account</h2>
            <p>Register as administrator or manager</p>
          </div>
          <form (ngSubmit)="onSignup()">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="signupCreds.name" name="signupName" required placeholder="Jane Doe" autocomplete="name">
            </div>
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="signupCreds.email" name="signupEmail" required placeholder="jane@humancloud.com" autocomplete="email">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="signupCreds.password" name="signupPassword" required placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="input-group">
              <label>System Role Rights</label>
              <select [(ngModel)]="signupCreds.role" name="signupRole" required class="role-select">
                <option value="ADMIN">ADMIN (System Administrator)</option>
                <option value="WAREHOUSE_MANAGER">WAREHOUSE MANAGER (Inventory & Warehousing)</option>
                <option value="STAFF_MANAGER">STAFF MANAGER (Operations & Staffing)</option>
              </select>
            </div>
            <button type="submit" class="btn-glow">Register Account</button>
          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem 0;
    }
    .login-box {
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      box-sizing: border-box;
    }
    .tab-header {
      display: flex;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.75rem;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s;
      border-bottom: 2px solid transparent;
    }
    .tab-btn:hover {
      color: white;
    }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header h2 {
      color: white;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }
    .header p {
      color: var(--text-muted);
      margin: 0;
    }
    .input-group {
      margin-bottom: 1.25rem;
      text-align: left;
    }
    .input-group label {
      display: block;
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    input, .role-select {
      width: 100%;
      padding: 1rem;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      color: white;
      font-size: 1rem;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    input:focus, .role-select:focus {
      outline: none;
      border-color: var(--accent);
      background: rgba(0,0,0,0.4);
      box-shadow: 0 0 0 4px rgba(233, 69, 96, 0.15);
    }
    .role-select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238b8d98' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down'%3E%3Cpath d='M6 9l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      cursor: pointer;
    }
    .role-select option {
      background: var(--bg-dark);
      color: white;
    }
    .btn-glow {
      width: 100%;
      background: linear-gradient(45deg, var(--accent), #ff0055);
      color: white;
      border: none;
      padding: 1.1rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px var(--accent-glow);
    }
    .alert-msg {
      color: #ff4757;
      background: rgba(255,71,87,0.1);
      padding: 0.8rem 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255,71,87,0.25);
      text-align: center;
      font-size: 0.9rem;
    }
    .alert-msg.success {
      color: #2ed573;
      background: rgba(46, 213, 115, 0.1);
      border-color: rgba(46, 213, 115, 0.25);
    }
  `]
})
export class LoginComponent {
  activeTab: 'login' | 'signup' = 'login';
  
  // Adjusted default password from "secretpassword" to the actual seeded password "admin123"
  loginCreds = { email: 'admin@humancloud.com', password: 'admin123' };
  
  signupCreds = { name: '', email: '', password: '', role: 'STAFF_MANAGER' };

  message = '';
  isSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.loginCreds).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err?.error?.message || 'Access Denied: Invalid email or password.';
        setTimeout(() => this.message = '', 5000);
      }
    });
  }

  onSignup() {
    if (!this.signupCreds.name || !this.signupCreds.email || !this.signupCreds.password) {
      this.isSuccess = false;
      this.message = 'Please fill out all registration fields.';
      return;
    }
    this.authService.register(this.signupCreds).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Account registered! You can now log in.';
        // Clear inputs and switch tab
        this.loginCreds.email = this.signupCreds.email;
        this.loginCreds.password = this.signupCreds.password;
        this.signupCreds = { name: '', email: '', password: '', role: 'STAFF_MANAGER' };
        setTimeout(() => {
          this.activeTab = 'login';
          this.message = '';
        }, 2000);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err?.error || 'Registration failed. Email may already be in use.';
        setTimeout(() => this.message = '', 5000);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  activeTab: 'login' | 'signup' = 'login';
  
  loginCreds = { email: 'admin@humancloud.com', password: 'admin123' };
  
  signupState: 'form' | 'verify' = 'form';
  signupCreds = { name: '', email: '', password: '', role: 'STAFF_MANAGER' };
  pendingSignup: any = null;
  otpCode = '';

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
    this.authService.requestSignupOtp(this.signupCreds).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'OTP sent. Please check your email and enter the code below.';
        this.pendingSignup = { ...this.signupCreds };
        this.signupState = 'verify';
        this.otpCode = '';
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err?.error || 'Registration failed. Email may already be in use.';
        setTimeout(() => this.message = '', 5000);
      }
    });
  }

  onVerifyOtp() {
    if (!this.otpCode || !this.pendingSignup?.email) {
      this.isSuccess = false;
      this.message = 'Enter the OTP code sent to your email.';
      return;
    }

    this.authService.verifyOtp({ email: this.pendingSignup.email, otp: this.otpCode }).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Email verified and account registered successfully. You may now sign in.';
        this.loginCreds.email = this.pendingSignup.email;
        this.loginCreds.password = this.pendingSignup.password;
        this.pendingSignup = null;
        this.signupCreds = { name: '', email: '', password: '', role: 'STAFF_MANAGER' };
        this.signupState = 'form';
        this.otpCode = '';
        setTimeout(() => {
          this.activeTab = 'login';
          this.message = '';
        }, 2500);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err?.error || 'OTP verification failed.';
        setTimeout(() => this.message = '', 5000);
      }
    });
  }

  onResendOtp() {
    if (!this.pendingSignup) {
      return;
    }
    this.authService.requestSignupOtp(this.pendingSignup).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'OTP resent to your email.';
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err?.error || 'Unable to resend OTP.';
      }
    });
  }

  cancelSignup() {
    this.signupState = 'form';
    this.otpCode = '';
    this.pendingSignup = null;
    this.message = '';
  }
}

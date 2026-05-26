import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-wrapper">
      <div class="glass-card verify-box">
        <h2>Email Verification</h2>
        <p *ngIf="status === 'pending'">Verifying your email now... please wait.</p>
        <p *ngIf="status === 'success'" class="success-text">{{ message }}</p>
        <p *ngIf="status === 'error'" class="error-text">{{ message }}</p>

        <div class="actions">
          <a routerLink="/login" class="btn-glow" *ngIf="status !== 'pending'">Go to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .verify-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem 1rem;
    }
    .verify-box {
      width: 100%;
      max-width: 520px;
      padding: 2.5rem;
      border-radius: 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 24px 60px rgba(0,0,0,0.45);
      text-align: center;
    }
    h2 {
      margin: 0 0 1rem;
      color: white;
      font-size: 2rem;
    }
    p {
      color: rgba(255,255,255,0.82);
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }
    .success-text {
      color: #7cfc00;
    }
    .error-text {
      color: #ff6b6b;
    }
    .actions {
      display: flex;
      justify-content: center;
    }
    .btn-glow {
      padding: 1rem 1.8rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #e94560, #ff0055);
      color: white;
      text-decoration: none;
      font-weight: 700;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 30px rgba(233,69,96,0.32);
    }
    `
  ]
})
export class VerifyEmailComponent implements OnInit {
  status: 'pending' | 'success' | 'error' = 'pending';
  message = 'Starting verification...';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const otp = this.route.snapshot.queryParamMap.get('otp');

    if (!email || !otp) {
      this.status = 'error';
      this.message = 'Verification link is invalid or missing required information.';
      return;
    }

    this.authService.verifyOtp({ email, otp }).subscribe({
      next: (res) => {
        this.status = 'success';
        this.message = res?.message ?? 'Email verified successfully. You can now sign in.';
      },
      error: (err) => {
        this.status = 'error';
        this.message = err?.error?.message || err?.error || 'OTP verification failed. Please request a new code.';
      }
    });
  }
}

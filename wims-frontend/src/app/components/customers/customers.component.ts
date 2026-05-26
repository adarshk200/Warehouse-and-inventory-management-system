import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header">
        <div>
          <h2>Customers</h2>
          <p>Record customer accounts, shipping details, and order contacts.</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h4>Total customers</h4>
          <p>{{ customers.length }}</p>
        </div>
        <div class="stat-card">
          <h4>Active contacts</h4>
          <p>{{ customers.length ? 'Ready to sell' : 'No customers' }}</p>
        </div>
      </div>

      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        {{ isError ? '⚠️' : '✅' }} {{ message }}
      </div>

      <form class="form-card glass-card" (ngSubmit)="createCustomer()" #customerForm="ngForm">
        <div class="form-grid">
          <div class="field-group">
            <label>Name <span class="required">*</span></label>
            <input type="text" [(ngModel)]="newCustomer.name" name="name" required placeholder="Enter customer name" />
            <small class="error-text" *ngIf="submitted && !newCustomer.name">Name is required</small>
          </div>

          <div class="field-group">
            <label>Email <span class="required">*</span></label>
            <input type="email" [(ngModel)]="newCustomer.email" name="email" required placeholder="customer@example.com" />
            <small class="error-text" *ngIf="submitted && !newCustomer.email">Email is required</small>
            <small class="error-text" *ngIf="submitted && newCustomer.email && !isValidEmail(newCustomer.email)">Invalid email format</small>
          </div>

          <div class="field-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="newCustomer.phone" name="phone" placeholder="Enter phone number" />
          </div>

          <div class="field-group">
            <label>Address</label>
            <input type="text" [(ngModel)]="newCustomer.address" name="address" placeholder="Enter address" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="!isFormValid()">Save Customer</button>
          <button type="button" class="btn-ghost" (click)="resetForm()">Clear</button>
        </div>
      </form>

      <div class="glass-card table-card">
        <h3>Customer Directory</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of customers">
                <td>{{ customer.name }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone || '-' }}</td>
                <td>{{ customer.address || '-' }}</td>
                <td>
                  <button class="btn-ghost" (click)="deleteCustomer(customer.id)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="customers.length === 0">
                <td colspan="5" class="empty-state">No customers yet. Add one above.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-section { padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h2 { font-size: 2rem; color: var(--text-main); margin: 0 0 0.5rem 0; }
    .page-header p { color: var(--text-muted); margin: 0; font-size: 0.9rem; }
    
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { padding: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
    .stat-card h4 { margin: 0 0 0.5rem 0; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; }
    .stat-card p { margin: 0; color: var(--text-main); font-size: 1.8rem; font-weight: 700; }
    
    .toast { padding: 1rem; border-radius: 8px; background: rgba(46, 213, 115, 0.1); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.25); margin-bottom: 1.5rem; }
    .toast-error { background: rgba(255, 71, 87, 0.1); color: #ff4757; border-color: rgba(255, 71, 87, 0.25); }
    
    .form-card { padding: 2rem; margin-bottom: 2rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    
    .field-group { display: flex; flex-direction: column; }
    .field-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; }
    .required { color: #ff4757; }
    
    .field-group input { 
      padding: 0.75rem; 
      background: rgba(0,0,0,0.2); 
      border: 1px solid rgba(255,255,255,0.1); 
      border-radius: 8px; 
      color: white;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .field-group input:focus { 
      outline: none; 
      border-color: var(--accent); 
      background: rgba(0,0,0,0.3);
      box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.15);
    }
    
    .error-text {
      color: #ff4757;
      font-size: 0.75rem;
      margin-top: 0.3rem;
      display: block;
    }
    
    .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .btn-primary { 
      padding: 0.85rem 1.5rem; 
      background: linear-gradient(135deg, var(--accent), #ff0055); 
      color: white; 
      border: none; 
      border-radius: 8px; 
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 16px rgba(233, 69, 96, 0.3);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-ghost { 
      padding: 0.85rem 1.5rem; 
      background: transparent; 
      color: var(--accent); 
      border: 1px solid var(--accent); 
      border-radius: 8px; 
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-ghost:hover { 
      background: rgba(233, 69, 96, 0.1);
    }
    
    .table-card { padding: 2rem; margin-bottom: 2rem; }
    .table-card h3 { margin: 0 0 1.5rem 0; color: var(--text-main); font-size: 1.25rem; }
    
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead { border-bottom: 2px solid rgba(255,255,255,0.1); }
    th { 
      padding: 1rem; 
      text-align: left; 
      color: var(--text-muted); 
      font-weight: 600; 
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td { 
      padding: 1rem; 
      color: var(--text-main); 
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    tr:hover { background: rgba(255,255,255,0.02); }
    .empty-state { text-align: center; color: var(--text-muted); font-style: italic; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: any[] = [];
  newCustomer = { name: '', email: '', phone: '', address: '' };
  message = '';
  isError = false;
  submitted = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return this.newCustomer.name.trim() !== '' && 
           this.newCustomer.email.trim() !== '' && 
           this.isValidEmail(this.newCustomer.email);
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: data => this.customers = data,
      error: () => this.showMessage('Unable to load customers.', true)
    });
  }

  createCustomer(): void {
    this.submitted = true;

    if (!this.isFormValid()) {
      this.showMessage('Please fill out all required fields correctly.', true);
      return;
    }

    const customerData = {
      name: this.newCustomer.name.trim(),
      email: this.newCustomer.email.trim(),
      phone: this.newCustomer.phone.trim() || null,
      address: this.newCustomer.address.trim() || null
    };

    this.customerService.addCustomer(customerData).subscribe({
      next: () => {
        this.showMessage('Customer added successfully.', false);
        this.resetForm();
        this.loadCustomers();
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Failed to add customer.';
        this.showMessage(errorMsg, true);
      }
    });
  }

  deleteCustomer(id: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.showMessage('Customer deleted.', false);
          this.loadCustomers();
        },
        error: () => this.showMessage('Failed to delete customer.', true)
      });
    }
  }

  resetForm(): void {
    this.newCustomer = { name: '', email: '', phone: '', address: '' };
    this.submitted = false;
  }

  private showMessage(text: string, error = false): void {
    this.message = text;
    this.isError = error;
    setTimeout(() => this.message = '', 3500);
  }
}
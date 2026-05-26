import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header">
        <div>
          <h2>Suppliers</h2>
          <p>Manage supplier contacts, vendor details, and procurement partners.</p>
        </div>
        <button class="btn-primary" (click)="resetForm()">Add Supplier</button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h4>Supplier count</h4>
          <p>{{ suppliers.length }}</p>
        </div>
        <div class="stat-card">
          <h4>Top vendors</h4>
          <p>{{ suppliers.length ? suppliers[0]?.name : 'Add suppliers' }}</p>
        </div>
      </div>

      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        {{ isError ? '⚠️' : '✅' }} {{ message }}
      </div>

      <form class="form-card glass-card" (ngSubmit)="createSupplier()">
        <div class="form-grid">
          <div class="field-group">
            <label>Supplier Name</label>
            <input type="text" [(ngModel)]="newSupplier.name" name="name" required />
          </div>

          <div class="field-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="newSupplier.email" name="email" required />
          </div>

          <div class="field-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="newSupplier.phone" name="phone" required />
          </div>

          <div class="field-group">
            <label>Address</label>
            <input type="text" [(ngModel)]="newSupplier.address" name="address" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Save Supplier</button>
          <button type="button" class="btn-ghost" (click)="resetForm()">Clear</button>
        </div>
      </form>

      <div class="glass-card table-card">
        <h3>Supplier List</h3>
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
              <tr *ngFor="let supplier of suppliers">
                <td>{{ supplier.name }}</td>
                <td>{{ supplier.email }}</td>
                <td>{{ supplier.phone }}</td>
                <td>{{ supplier.address }}</td>
                <td>
                  <button class="btn-ghost" (click)="deleteSupplier(supplier.id)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="suppliers.length === 0">
                <td colspan="5" class="empty-state">No suppliers yet. Add one above.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  newSupplier = { name: '', email: '', phone: '', address: '' };
  message = '';
  isError = false;

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: data => { this.suppliers = data; },
      error: () => { this.showMessage('Unable to load suppliers.', true); }
    });
  }

  createSupplier(): void {
    this.supplierService.addSupplier(this.newSupplier).subscribe({
      next: () => {
        this.showMessage('Supplier added successfully.', false);
        this.resetForm();
        this.loadSuppliers();
      },
      error: () => this.showMessage('Failed to add supplier.', true)
    });
  }

  deleteSupplier(id: string): void {
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => {
        this.showMessage('Supplier deleted.', false);
        this.loadSuppliers();
      },
      error: () => this.showMessage('Failed to delete supplier.', true)
    });
  }

  resetForm(): void {
    this.newSupplier = { name: '', email: '', phone: '', address: '' };
  }

  private showMessage(text: string, error = false): void {
    this.message = text;
    this.isError = error;
    setTimeout(() => this.message = '', 3500);
  }
}

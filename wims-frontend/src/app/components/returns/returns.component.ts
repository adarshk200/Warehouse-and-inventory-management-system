import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { WarehouseService } from '../../services/warehouse.service';
import { ReturnsService } from '../../services/returns.service';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header">
        <div>
          <h2>Returns</h2>
          <p>Record returned goods, damage reports, and stock authorizations.</p>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-card glass-card">
          <div class="sum-icon">↩️</div>
          <div>
            <div class="sum-val">{{ returnCount }}</div>
            <div class="sum-label">Return Records</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">⏳</div>
          <div>
            <div class="sum-val">{{ pendingReturnCount }}</div>
            <div class="sum-label">Pending</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">✅</div>
          <div>
            <div class="sum-val">{{ resolvedReturnCount }}</div>
            <div class="sum-label">Resolved</div>
          </div>
        </div>
      </div>

      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        {{ isError ? '⚠️' : '✅' }} {{ message }}
      </div>

      <form class="form-card glass-card" (ngSubmit)="createReturn()">
        <div class="form-grid">
          <div class="field-group">
            <label>Product</label>
            <select [(ngModel)]="newReturn.productId" name="productId" required>
              <option value="" disabled selected>Select product</option>
              <option *ngFor="let product of products" [value]="product.id">
                {{ product.name }} ({{ product.sku }})
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Warehouse</label>
            <select [(ngModel)]="newReturn.warehouseId" name="warehouseId" required>
              <option value="" disabled selected>Select warehouse</option>
              <option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
                {{ warehouse.name }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Quantity</label>
            <input type="number" min="1" [(ngModel)]="newReturn.quantity" name="quantity" required />
          </div>

          <div class="field-group">
            <label>Reason</label>
            <input type="text" [(ngModel)]="newReturn.reason" name="reason" required />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Submit Return</button>
          <button type="button" class="btn-ghost" (click)="resetForm()">Clear</button>
        </div>
      </form>

      <div class="glass-card table-card">
        <h3>Return Records</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of returns">
                <td>{{ (item.id || '').substring(0, 8).toUpperCase() }}</td>
                <td>{{ item.product?.name || '—' }}</td>
                <td>{{ item.warehouse?.name || '—' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.reason }}</td>
                <td>{{ item.status }}</td>
                <td>{{ item.createdAt | date:'MMM d, HH:mm' }}</td>
              </tr>
              <tr *ngIf="returns.length === 0">
                <td colspan="7" class="empty-state">No return records yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReturnsComponent implements OnInit {
  products: any[] = [];
  warehouses: any[] = [];
  returns: any[] = [];
  newReturn = { productId: '', warehouseId: '', quantity: 1, reason: '' };
  message = '';
  isError = false;

  get returnCount(): number {
    return this.returns.length;
  }

  get pendingReturnCount(): number {
    return this.returns.filter(item => item.status === 'PENDING').length;
  }

  get resolvedReturnCount(): number {
    return this.returns.filter(item => item.status === 'RESOLVED' || item.status === 'COMPLETED').length;
  }

  constructor(
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private returnsService: ReturnsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getProducts().subscribe({ next: data => this.products = data });
    this.warehouseService.getWarehouses().subscribe({ next: data => this.warehouses = data });
    this.returnsService.getReturns().subscribe({ next: data => this.returns = data });
  }

  createReturn(): void {
    const payload = {
      status: 'PENDING',
      reason: this.newReturn.reason,
      quantity: this.newReturn.quantity,
      product: { id: this.newReturn.productId },
      warehouse: { id: this.newReturn.warehouseId }
    };

    this.returnsService.addReturn(payload).subscribe({
      next: () => {
        this.showMessage('Return recorded successfully.', false);
        this.resetForm();
        this.loadData();
      },
      error: () => this.showMessage('Failed to record return.', true)
    });
  }

  resetForm(): void {
    this.newReturn = { productId: '', warehouseId: '', quantity: 1, reason: '' };
  }

  private showMessage(text: string, error = false): void {
    this.message = text;
    this.isError = error;
    setTimeout(() => this.message = '', 3500);
  }
}

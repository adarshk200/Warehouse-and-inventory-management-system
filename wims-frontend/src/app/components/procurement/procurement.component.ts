import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { WarehouseService } from '../../services/warehouse.service';
import { SupplierService } from '../../services/supplier.service';
import { ProcurementService } from '../../services/procurement.service';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header">
        <div>
          <h2>Procurement</h2>
          <p>Create purchase orders and manage restocking activity.</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h4>Open orders</h4>
          <p>{{ orders.length }}</p>
        </div>
        <div class="stat-card">
          <h4>Suppliers</h4>
          <p>{{ suppliers.length }}</p>
        </div>
        <div class="stat-card">
          <h4>Warehouses</h4>
          <p>{{ warehouses.length }}</p>
        </div>
      </div>

      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        {{ isError ? '⚠️' : '✅' }} {{ message }}
      </div>

      <form class="form-card glass-card" (ngSubmit)="createPurchaseOrder()">
        <div class="form-grid">
          <div class="field-group">
            <label>Product</label>
            <select [(ngModel)]="newOrder.productId" name="productId" required>
              <option value="" disabled selected>Select product</option>
              <option *ngFor="let product of products" [value]="product.id">
                {{ product.name }} ({{ product.sku }})
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Warehouse</label>
            <select [(ngModel)]="newOrder.warehouseId" name="warehouseId" required>
              <option value="" disabled selected>Select warehouse</option>
              <option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
                {{ warehouse.name }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Supplier</label>
            <select [(ngModel)]="newOrder.supplierId" name="supplierId" required>
              <option value="" disabled selected>Select supplier</option>
              <option *ngFor="let supplier of suppliers" [value]="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Quantity</label>
            <input type="number" min="1" [(ngModel)]="newOrder.quantity" name="quantity" required />
          </div>

          <div class="field-group">
            <label>Total Amount</label>
            <input type="number" [value]="calculatedTotal" readonly />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Create Purchase Order</button>
          <button type="button" class="btn-ghost" (click)="resetForm()">Clear</button>
        </div>
      </form>

      <div class="glass-card table-card">
        <h3>Purchase Order History</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Supplier</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td>{{ (order.id || '').substring(0, 8).toUpperCase() }}</td>
                <td>{{ order.product?.name || '—' }}</td>
                <td>{{ order.warehouse?.name || '—' }}</td>
                <td>{{ order.supplier?.name || '—' }}</td>
                <td>{{ order.quantity }}</td>
                <td>{{ order.totalAmount | number:'1.2-2' }}</td>
                <td>{{ order.status }}</td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="7" class="empty-state">No purchase orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProcurementComponent implements OnInit {
  products: any[] = [];
  warehouses: any[] = [];
  suppliers: any[] = [];
  orders: any[] = [];
  newOrder = { productId: '', warehouseId: '', supplierId: '', quantity: 1 };
  message = '';
  isError = false;

  constructor(
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private supplierService: SupplierService,
    private procurementService: ProcurementService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get calculatedTotal(): number {
    const product = this.products.find(p => p.id === this.newOrder.productId);
    return product ? (Number(product.price) * this.newOrder.quantity) : 0;
  }

  loadData(): void {
    this.productService.getProducts().subscribe({ next: data => this.products = data });
    this.warehouseService.getWarehouses().subscribe({ next: data => this.warehouses = data });
    this.supplierService.getSuppliers().subscribe({ next: data => this.suppliers = data });
    this.procurementService.getPurchaseOrders().subscribe({ next: data => this.orders = data });
  }

  createPurchaseOrder(): void {
    const payload = {
      status: 'REQUESTED',
      quantity: this.newOrder.quantity,
      totalAmount: this.calculatedTotal,
      product: { id: this.newOrder.productId },
      warehouse: { id: this.newOrder.warehouseId },
      supplier: { id: this.newOrder.supplierId }
    };

    this.procurementService.addPurchaseOrder(payload).subscribe({
      next: () => {
        this.showMessage('Purchase order created.', false);
        this.resetForm();
        this.loadData();
      },
      error: () => this.showMessage('Failed to create purchase order.', true)
    });
  }

  resetForm(): void {
    this.newOrder = { productId: '', warehouseId: '', supplierId: '', quantity: 1 };
  }

  private showMessage(text: string, error = false): void {
    this.message = text;
    this.isError = error;
    setTimeout(() => this.message = '', 3500);
  }
}

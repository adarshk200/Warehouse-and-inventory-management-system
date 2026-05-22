import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card full-width fade-in-up">
      <div class="header-flex">
        <div>
          <h2>Global Inventory Items</h2>
          <p class="subtitle" style="color: var(--text-muted); margin: 0.25rem 0 0 0;">Synchronized with Redis Distributed Cache</p>
        </div>
        <div class="actions">
          <div *ngIf="message" class="toast-success">{{ message }}</div>
          <button *ngIf="canAddProduct" class="btn-register" (click)="registerProduct()">+ Register Item</button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Weight (kg)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products" class="table-row">
              <td><span class="sku-badge">{{ product.sku }}</span></td>
              <td class="bold-text">{{ product.name }}</td>
              <td class="category-cell">{{ product.subcategory?.category?.name || 'Unclassified' }}</td>
              <td><span class="subcat-badge">{{ product.subcategory?.name || 'N/A' }}</span></td>
              <td class="price">\${{ product.price }}</td>
              <td>{{ product.weightKg }} kg</td>
              <td>
                <button class="btn-action pulse" (click)="placeOrder(product.id)">Place Order</button>
              </td>
            </tr>
            <tr *ngIf="products.length === 0">
               <td colspan="7" class="empty">No products detected. Click "+ Register Item" to add one.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .full-width { padding: 2.5rem; }
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h2 { color: var(--text-light); font-size: 2rem; margin: 0; }
    .actions { display: flex; align-items: center; gap: 1.5rem; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
    th { text-align: left; padding: 1rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    td { padding: 1.2rem 1rem; background: rgba(255,255,255,0.02); }
    .table-row { transition: all 0.3s; }
    .table-row:hover td { background: rgba(255,255,255,0.05); }
    .sku-badge { background: rgba(233, 69, 96, 0.15); color: var(--accent); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-family: monospace; border: 1px solid rgba(233, 69, 96, 0.3); }
    .subcat-badge { background: rgba(255, 255, 255, 0.05); color: var(--text-light); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.08); }
    .category-cell { color: var(--text-muted); font-weight: 500; }
    .bold-text { color: white; font-weight: 500; font-size: 1.1rem; }
    .price { color: #2ed573; font-weight: bold; }
    .btn-action { background: transparent; color: #2ed573; border: 1px solid #2ed573; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.3s; font-weight: 600; font-size: 0.9rem; }
    .btn-action:hover { background: #2ed573; color: black; box-shadow: 0 0 10px rgba(46, 213, 115, 0.4); }
    .btn-register { background: linear-gradient(45deg, var(--accent), #ff0055); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
    .btn-register:hover { transform: translateY(-1px); box-shadow: 0 5px 15px var(--accent-glow); }
    .empty { text-align: center; padding: 3rem; color: var(--text-muted); font-style: italic; }
    .toast-success { background: rgba(46, 213, 115, 0.2); color: #2ed573; padding: 0.8rem 1.5rem; border-radius: 8px; border: 1px solid rgba(46, 213, 115, 0.3); animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  message: string = '';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  get canAddProduct(): boolean {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'WAREHOUSE_MANAGER';
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  registerProduct() {
    this.router.navigate(['/add-product']);
  }

  placeOrder(productId: string) {
    console.log('🔄 Placing order for product:', productId);
    console.log('📋 Current User Role:', this.authService.getUserRole());
    console.log('🔑 JWT Token exists:', !!this.authService.getToken());
    
    this.orderService.placeOrder(productId, 1).subscribe({
      next: res => {
        console.log('✅ Order placed successfully:', res);
        this.message = 'Stock Reserved! Fired to Kafka & RabbitMQ.';
        setTimeout(() => this.message = '', 4000);
      },
      error: err => {
         console.error('❌ Order failed:', err);
         console.error('Status:', err.status);
         console.error('Error body:', err.error);
         
         let errorMessage = 'Unable to place order.';
         if (err.status === 403) {
           errorMessage = '🔒 Access Denied: Check user role/permissions on backend';
         } else if (err?.error?.message) {
           errorMessage = err.error.message;
         } else if (err?.message) {
           errorMessage = err.message;
         }
         
         this.message = 'Error: ' + errorMessage;
         setTimeout(() => this.message = '', 4000);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header">
        <div>
          <h2>Sales Dashboard</h2>
          <p>Monitor order revenue, fulfillment progress, and sales trends.</p>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-card glass-card">
          <div class="sum-icon">💵</div>
          <div>
            <div class="sum-val">{{ totalRevenue | number:'1.2-2' }}</div>
            <div class="sum-label">Revenue</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">🚚</div>
          <div>
            <div class="sum-val">{{ shippedCount }}</div>
            <div class="sum-label">Shipped Orders</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">⌛</div>
          <div>
            <div class="sum-val">{{ pendingCount }}</div>
            <div class="sum-label">Pending Orders</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">📈</div>
          <div>
            <div class="sum-val">{{ averageOrderValue | number:'1.2-2' }}</div>
            <div class="sum-label">Avg Order</div>
          </div>
        </div>
      </div>

      <div class="glass-card table-card">
        <h3>Recent Sales</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product(s)</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of recentSales">
                <td>{{ (order.id || '').substring(0, 8).toUpperCase() }}</td>
                <td>
                  <div class="customer-name" style="color: white; font-weight: 600;">{{ order.customer?.name || 'Walk-in Customer' }}</div>
                  <div class="customer-email" style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">{{ order.customer?.email || '' }}</div>
                </td>
                <td>
                  <div *ngFor="let item of order.items" style="margin-bottom: 0.2rem;">
                    <div class="product-name" style="color: white; font-weight: 500;">{{ item.product?.name || '—' }} <span style="color: var(--text-muted); font-size: 0.8rem;">(×{{ item.quantity || 1 }})</span></div>
                  </div>
                  <div *ngIf="!order.items || order.items.length === 0">—</div>
                </td>
                <td><span class="status-chip {{ order.status?.toLowerCase() }}">{{ order.status }}</span></td>
                <td>{{ order.totalAmount | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="recentSales.length === 0">
                <td colspan="5" class="empty-state">No sales data available.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SalesComponent implements OnInit {
  totalRevenue = 0;
  shippedCount = 0;
  pendingCount = 0;
  averageOrderValue = 0;
  recentSales: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: orders => {
        this.totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
        this.shippedCount = orders.filter((o: any) => o.status === 'SHIPPED').length;
        this.pendingCount = orders.filter((o: any) => o.status !== 'SHIPPED' && o.status !== 'CANCELLED').length;
        this.averageOrderValue = orders.length ? this.totalRevenue / orders.length : 0;
        this.recentSales = orders.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      }
    });
  }
}

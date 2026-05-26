import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-section page-card fade-in-up">
      <div class="page-header report-header">
        <div>
          <h2>Reports</h2>
          <p>Business history, yearly data exports, and inventory analytics in one place.</p>
        </div>
        <div class="report-actions">
          <label>
            Period
            <select [(ngModel)]="selectedPeriod" (ngModelChange)="refreshReport()">
              <option *ngFor="let option of periodOptions" [value]="option.value">{{ option.label }}</option>
            </select>
          </label>
          <button class="btn-primary" (click)="downloadExcel()">Export to Excel</button>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-card glass-card">
          <div class="sum-icon">🧾</div>
          <div>
            <div class="sum-val">{{ filteredOrderCount }}</div>
            <div class="sum-label">Orders in History</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">💰</div>
          <div>
            <div class="sum-val">{{ filteredRevenue | number:'1.2-2' }}</div>
            <div class="sum-label">Revenue in Period</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">📦</div>
          <div>
            <div class="sum-val">{{ inventoryCount }}</div>
            <div class="sum-label">Inventory Lines</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">⚠️</div>
          <div>
            <div class="sum-val">{{ lowStockCount }}</div>
            <div class="sum-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      <div class="glass-card table-card">
        <div class="table-card-header">
          <div>
            <h3>Order History</h3>
            <p class="subtitle">Showing {{ periodLabel }} orders. Download full report to Excel for offline review.</p>
          </div>
          <div class="history-count">{{ filteredOrderCount }} records</div>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product(s)</th>
                <th>Warehouse(s)</th>
                <th>Status</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>{{ (order.id || '').substring(0, 8).toUpperCase() }}</td>
                <td>{{ order.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="customer-name" style="color: white; font-weight: 600;">{{ order.customer?.name || 'Walk-in Customer' }}</div>
                  <div class="customer-email" style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">{{ order.customer?.email || '' }}</div>
                </td>
                <td>
                  <div *ngFor="let item of order.items" style="margin-bottom: 0.2rem;">
                    <div class="product-name" style="color: white; font-weight: 500;">{{ item.product?.name || '—' }} <span style="color: var(--text-muted); font-size: 0.8rem; font-family: monospace;">({{ item.product?.sku || '' }})</span></div>
                  </div>
                  <div *ngIf="!order.items || order.items.length === 0">—</div>
                </td>
                <td>
                  <div *ngFor="let item of order.items" style="margin-bottom: 0.2rem;">
                    <div class="warehouse-name" style="color: var(--text-light); font-weight: 500;">{{ item.warehouse?.name || '—' }}</div>
                  </div>
                  <div *ngIf="!order.items || order.items.length === 0">—</div>
                </td>
                <td><span class="status-chip {{ order.status?.toLowerCase() }}">{{ order.status }}</span></td>
                <td>
                  <div *ngFor="let item of order.items" style="margin-bottom: 0.2rem;">
                    <span class="qty-chip" style="background: rgba(255,255,255,0.07); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">× {{ item.quantity || 1 }}</span>
                  </div>
                  <div *ngIf="!order.items || order.items.length === 0">× 0</div>
                </td>
                <td>{{ order.totalAmount | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="8" class="empty-state">No orders found for this period.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .report-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
      .report-actions { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
      .report-actions label { color: var(--text-muted); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; }
      .report-actions select { min-width: 150px; padding: 0.8rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: var(--text-light); }
      .btn-primary { background: linear-gradient(135deg, var(--accent), #ff0055); color: white; border: none; padding: 0.9rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 700; }
      .summary-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.75rem; }
      .table-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 1rem; }
      .history-count { color: var(--text-muted); font-size: 0.95rem; }
      .subtitle { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
      .table-responsive { overflow-x: auto; }
      table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
      th { text-align: left; padding: 1rem 1rem 0.75rem 1rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.07em; }
      td { padding: 1rem 1rem; background: rgba(255,255,255,0.04); color: var(--text-light); }
      .status-chip { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
      .status-chip.pending { background: rgba(255, 193, 7, 0.18); color: #f1c40f; }
      .status-chip.completed { background: rgba(46, 213, 115, 0.18); color: #2ed573; }
      .status-chip.cancelled { background: rgba(255, 71, 87, 0.18); color: #ff4757; }
      .empty-state { text-align: center; color: var(--text-muted); padding: 2rem; font-style: italic; }
      .table-card { padding: 2rem; }
    `
  ]
})
export class ReportsComponent implements OnInit {
  orderCount = 0;
  totalRevenue = 0;
  inventoryCount = 0;
  lowStockCount = 0;
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedPeriod = '1y';
  periodOptions = [
    { value: '1y', label: 'Last 1 Year' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '3m', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' }
  ];

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  get filteredOrderCount(): number {
    return this.filteredOrders.length;
  }

  get filteredRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }

  get periodLabel(): string {
    const option = this.periodOptions.find(opt => opt.value === this.selectedPeriod);
    return option ? option.label : 'Selected Period';
  }

  loadReports(): void {
    this.reportsService.getOrders().subscribe({
      next: orders => {
        this.orders = orders.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.orderCount = this.orders.length;
        this.totalRevenue = this.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
        this.refreshReport();
      }
    });

    this.reportsService.getInventories().subscribe({
      next: inventories => {
        this.inventoryCount = inventories.length;
        this.lowStockCount = inventories.filter((inv: any) => inv.availableQuantity < 10).length;
      }
    });
  }

  refreshReport(): void {
    const now = new Date();
    const cutoff = new Date(now);

    switch (this.selectedPeriod) {
      case '1y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case '6m':
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case '3m':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      default:
        cutoff.setFullYear(1970);
    }

    this.filteredOrders = this.orders.filter(order => {
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      return createdAt ? createdAt >= cutoff : false;
    });
  }

  downloadExcel(): void {
    const headers = ['Order ID', 'Date', 'Customer', 'Product(s)', 'Warehouse(s)', 'Status', 'Total Quantity', 'Amount'];
    const rows = this.filteredOrders.map(order => {
      const productNames = (order.items || []).map((i: any) => `${i.product?.name || '—'} (x${i.quantity || 1})`).join(', ');
      const warehouseNames = Array.from(new Set((order.items || []).map((i: any) => i.warehouse?.name || '—'))).join(', ');
      const totalQty = (order.items || []).reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
      
      return [
        order.id || '',
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
        order.customer ? `${order.customer.name} (${order.customer.email || ''})` : 'Walk-in Customer',
        productNames || '—',
        warehouseNames || '—',
        order.status || '',
        totalQty,
        order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '0.00'
      ];
    });

    const htmlTable = `
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${this.escapeExcelValue(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;

    const htmlDoc = `<html><head><meta charset="UTF-8"></head><body>${htmlTable}</body></html>`;
    const blob = new Blob([htmlDoc], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wims-report-${this.selectedPeriod}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escapeExcelValue(value: any): string {
    return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

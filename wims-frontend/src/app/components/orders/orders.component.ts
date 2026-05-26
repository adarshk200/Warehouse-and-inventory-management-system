import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-page fade-in-up">

      <!-- ===== PAGE HEADER ===== -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Order Processing</h2>
          <p class="page-sub">Track and manage all warehouse orders through fulfilment</p>
        </div>
        <div class="refresh-btn" (click)="loadOrders()">🔄 Refresh</div>
      </div>

      <!-- ===== TOAST ===== -->
      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        {{ isError ? '⚠️' : '✅' }} {{ message }}
      </div>

      <!-- ===== PIPELINE STATS ===== -->
      <div class="pipeline-bar">
        <div class="pipe-stat glass-card" *ngFor="let s of statusStats">
          <span class="pipe-dot" [style.background]="s.color"></span>
          <div>
            <div class="pipe-count">{{ s.count }}</div>
            <div class="pipe-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- ===== ORDERS TABLE ===== -->
      <div class="glass-card table-card">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product(s)</th>
                <th>Warehouse(s)</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th *ngIf="canManage">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders" class="table-row" [class.row-shipped]="o.status==='SHIPPED'" [class.row-cancelled]="o.status==='CANCELLED'">
                <td>
                  <span class="order-id">{{ (o.id || '').substring(0, 8).toUpperCase() }}…</span>
                </td>
                <td>
                  <div class="customer-name" style="color: white; font-weight: 600;">{{ o.customer?.name || 'Walk-in Customer' }}</div>
                  <div class="customer-email" style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">{{ o.customer?.email || '' }}</div>
                </td>
                <td>
                  <div *ngFor="let item of o.items" style="margin-bottom: 0.4rem;">
                    <div class="product-name" style="color: white; font-weight: 500;">{{ item.product?.name || '—' }}</div>
                    <div class="product-sku" style="color: var(--text-muted); font-size: 0.8rem; font-family: monospace;">{{ item.product?.sku || '' }}</div>
                  </div>
                  <div *ngIf="!o.items || o.items.length === 0" class="product-name">—</div>
                </td>
                <td>
                  <div *ngFor="let item of o.items" style="margin-bottom: 0.4rem;">
                    <div class="warehouse-name" style="color: var(--text-light); font-weight: 500;">{{ item.warehouse?.name || '—' }}</div>
                    <div class="warehouse-loc" style="color: var(--text-muted); font-size: 0.8rem;">{{ item.warehouse?.location || '' }}</div>
                  </div>
                  <div *ngIf="!o.items || o.items.length === 0" class="warehouse-name">—</div>
                </td>
                <td>
                  <div *ngFor="let item of o.items" style="margin-bottom: 0.4rem;">
                    <span class="qty-chip">× {{ item.quantity || 1 }}</span>
                  </div>
                  <div *ngIf="!o.items || o.items.length === 0">
                    <span class="qty-chip">× 0</span>
                  </div>
                </td>
                <td>
                  <span class="amount">\${{ o.totalAmount | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span class="status-chip" [ngClass]="'status-' + (o.status || 'PROCESSING').toLowerCase()">
                    <span class="status-dot"></span>
                    {{ o.status }}
                  </span>
                </td>
                <td class="date-cell">{{ o.createdAt | date:'MMM d, HH:mm' }}</td>
                <td *ngIf="canManage">
                  <div class="action-buttons">
                    <!-- PICK: Only for PROCESSING orders -->
                    <button
                      *ngIf="o.status === 'PROCESSING'"
                      class="action-btn btn-pick"
                      (click)="pickOrder(o)"
                      title="Mark items as picked">
                      📋 Pick
                    </button>

                    <!-- SHIP: Only for PICKED orders -->
                    <button
                      *ngIf="o.status === 'PICKED'"
                      class="action-btn btn-ship"
                      (click)="shipOrder(o)"
                      title="Mark order as shipped">
                      🚚 Ship
                    </button>

                    <!-- CANCEL: Only for PROCESSING or PICKED orders -->
                    <button
                      *ngIf="o.status === 'PROCESSING' || o.status === 'PICKED'"
                      class="action-btn btn-cancel"
                      (click)="cancelOrder(o)"
                      title="Cancel and restore stock">
                      ✕
                    </button>

                    <!-- DONE indicator -->
                    <span *ngIf="o.status === 'SHIPPED'" class="done-label">✅ Fulfilled</span>
                    <span *ngIf="o.status === 'CANCELLED'" class="cancelled-label">🚫 Cancelled</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td [attr.colspan]="canManage ? 9 : 8" class="empty-state">
                  <div class="empty-icon">📭</div>
                  <p>No orders yet. Place orders from the Products page.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <!-- ===== STATUS GUIDE ===== -->
      <div class="status-guide glass-card">
        <h4>📖 Order Lifecycle</h4>
        <div class="guide-flow">
          <div class="guide-step">
            <span class="guide-icon processing">🔄</span>
            <div>
              <strong>PROCESSING</strong>
              <p>Stock reserved. Awaiting warehouse picking.</p>
            </div>
          </div>
          <div class="guide-arrow">→</div>
          <div class="guide-step">
            <span class="guide-icon picked">📋</span>
            <div>
              <strong>PICKED</strong>
              <p>Items physically picked from shelves.</p>
            </div>
          </div>
          <div class="guide-arrow">→</div>
          <div class="guide-step">
            <span class="guide-icon shipped">🚚</span>
            <div>
              <strong>SHIPPED</strong>
              <p>Dispatched. Reserved stock released permanently.</p>
            </div>
          </div>
          <div class="guide-arrow cancel-arrow">↩</div>
          <div class="guide-step">
            <span class="guide-icon cancelled">🚫</span>
            <div>
              <strong>CANCELLED</strong>
              <p>Stock restored back to available inventory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { padding-bottom: 3rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-title { color: white; font-size: 2.2rem; margin: 0; }
    .page-sub { color: var(--text-muted); margin: 0.25rem 0 0 0; }
    .refresh-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted); padding: 0.6rem 1.25rem; border-radius: 8px;
      cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.9rem;
    }
    .refresh-btn:hover { border-color: rgba(255,255,255,0.3); color: white; }
    .toast {
      background: rgba(46,213,115,0.15); border: 1px solid rgba(46,213,115,0.3);
      color: #2ed573; padding: 1rem 1.5rem; border-radius: 10px;
      margin-bottom: 1.5rem; animation: slideDown 0.3s ease;
    }
    .toast.toast-error { background: rgba(255,71,87,0.15); border-color: rgba(255,71,87,0.3); color: #ff4757; }
    @keyframes slideDown { from { transform: translateY(-15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .pipeline-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .pipe-stat {
      padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem;
    }
    .pipe-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .pipe-count { color: black; font-size: 1.75rem; font-weight: 800; line-height: 1; }
    .pipe-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0.2rem; }
    .table-card { padding: 0; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th { text-align: left; padding: 1.1rem 1.25rem; color: var(--text-muted); font-weight: 600;
         text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;
         border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
    td { padding: 1.1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
    .table-row { transition: background 0.2s; }
    .table-row:hover td { background: rgba(255,255,255,0.025); }
    .row-shipped td { opacity: 0.65; }
    .row-cancelled td { opacity: 0.45; }
    .order-id { font-family: monospace; font-size: 0.9rem; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 0.3rem 0.6rem; border-radius: 4px; }
    .product-name { color: white; font-weight: 600; }
    .product-sku { color: var(--text-muted); font-size: 0.8rem; margin-top: 2px; }
    .warehouse-name { color: var(--text-light); font-weight: 500; }
    .warehouse-loc { color: var(--text-muted); font-size: 0.8rem; margin-top: 2px; }
    .qty-chip { background: rgba(255,255,255,0.07); color: white; padding: 0.3rem 0.7rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; }
    .amount { color: #2ed573; font-weight: 700; font-size: 1.05rem; }
    .date-cell { color: var(--text-muted); font-size: 0.9rem; }
    /* Status chips */
    .status-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.9rem; border-radius: 20px; font-weight: 700;
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .status-processing { background: rgba(243,156,18,0.15); color: #f1c40f; border: 1px solid rgba(243,156,18,0.3); }
    .status-picked { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid rgba(116,185,255,0.3); }
    .status-shipped { background: rgba(46,213,115,0.15); color: #2ed573; border: 1px solid rgba(46,213,115,0.3); }
    .status-cancelled { background: rgba(255,71,87,0.1); color: #ff4757; border: 1px solid rgba(255,71,87,0.2); }
    /* Action buttons */
    .action-buttons { display: flex; align-items: center; gap: 0.5rem; }
    .action-btn {
      padding: 0.45rem 0.9rem; border-radius: 7px; border: none;
      font-weight: 700; font-size: 0.82rem; cursor: pointer;
      transition: all 0.25s; white-space: nowrap;
    }
    .btn-pick { background: rgba(116,185,255,0.15); color: #74b9ff; border: 1px solid rgba(116,185,255,0.35); }
    .btn-pick:hover { background: #74b9ff; color: #0f1015; box-shadow: 0 4px 12px rgba(116,185,255,0.4); }
    .btn-ship { background: rgba(46,213,115,0.15); color: #2ed573; border: 1px solid rgba(46,213,115,0.35); }
    .btn-ship:hover { background: #2ed573; color: #0f1015; box-shadow: 0 4px 12px rgba(46,213,115,0.4); }
    .btn-cancel { background: rgba(255,71,87,0.1); color: #ff4757; border: 1px solid rgba(255,71,87,0.3); padding: 0.45rem 0.7rem; }
    .btn-cancel:hover { background: #ff4757; color: white; box-shadow: 0 4px 12px rgba(255,71,87,0.4); }
    .done-label { color: #2ed573; font-size: 0.85rem; font-weight: 600; }
    .cancelled-label { color: #ff4757; font-size: 0.85rem; font-weight: 600; }
    .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    /* Status guide */
    .status-guide { padding: 2rem; margin-top: 2rem; }
    .status-guide h4 { color: white; margin: 0 0 1.5rem 0; font-size: 1.1rem; }
    .guide-flow { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .guide-step { display: flex; align-items: flex-start; gap: 0.75rem; }
    .guide-icon { font-size: 1.5rem; padding-top: 0.1rem; }
    .guide-step strong { color: black; font-size: 0.9rem; display: block; }
    .guide-step p { color: var(--text-muted); font-size: 0.8rem; margin: 0.2rem 0 0 0; max-width: 130px; }
    .guide-arrow { color: var(--text-muted); font-size: 1.5rem; font-weight: 300; }
    .cancel-arrow { color: #ff4757; font-size: 1.2rem; transform: rotate(-30deg); }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  message = '';
  isError = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  get canManage(): boolean {
    const r = this.authService.getUserRole();
    return r === 'ADMIN' || r === 'WAREHOUSE_MANAGER';
  }

  get statusStats() {
    const counts = { PROCESSING: 0, PICKED: 0, SHIPPED: 0, CANCELLED: 0 };
    this.orders.forEach(o => {
      const s = (o.status || 'PROCESSING').toUpperCase() as keyof typeof counts;
      if (s in counts) counts[s]++;
    });
    return [
      { label: 'Processing', count: counts.PROCESSING, color: '#f1c40f' },
      { label: 'Picked',     count: counts.PICKED,     color: '#74b9ff' },
      { label: 'Shipped',    count: counts.SHIPPED,    color: '#2ed573' },
      { label: 'Cancelled',  count: counts.CANCELLED,  color: '#ff4757' },
    ];
  }

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: data => this.orders = data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      error: () => this.showToast('Failed to load orders', true)
    });
  }

  pickOrder(order: any) {
    this.orderService.updateStatus(order.id, 'PICKED').subscribe({
      next: updated => {
        order.status = 'PICKED';
        this.showToast(`📋 Order picked — items ready for dispatch`);
      },
      error: err => this.showToast(err?.error?.message || 'Failed to pick order', true)
    });
  }

  shipOrder(order: any) {
    this.orderService.updateStatus(order.id, 'SHIPPED').subscribe({
      next: updated => {
        order.status = 'SHIPPED';
        this.showToast(`🚚 Order shipped! Reserved stock has been released`);
      },
      error: err => this.showToast(err?.error?.message || 'Failed to ship order', true)
    });
  }

  cancelOrder(order: any) {
    this.orderService.updateStatus(order.id, 'CANCELLED').subscribe({
      next: updated => {
        order.status = 'CANCELLED';
        this.showToast(`🔄 Order cancelled — stock restored to available inventory`);
      },
      error: err => this.showToast(err?.error?.message || 'Failed to cancel order', true)
    });
  }

  showToast(msg: string, err = false) {
    this.message = msg;
    this.isError = err;
    setTimeout(() => this.message = '', 4500);
  }
}

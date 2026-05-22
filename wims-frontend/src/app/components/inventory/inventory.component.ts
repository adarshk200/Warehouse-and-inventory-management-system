import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inv-page fade-in-up">

      <!-- ===== PAGE HEADER ===== -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Inventory Operations</h2>
          <p class="page-sub">Live stock levels across all warehouses</p>
        </div>
        <div class="action-group" *ngIf="canManage">
          <button class="btn-secondary" (click)="openMoveModal()">
            <span>🔄</span> Move Stock
          </button>
          <button class="btn-primary" (click)="openReceiveModal()">
            <span>📥</span> Receive Stock
          </button>
        </div>
      </div>

      <!-- ===== TOAST ===== -->
      <div class="toast" *ngIf="message" [class.toast-error]="isError">
        <span>{{ isError ? '⚠️' : '✅' }}</span> {{ message }}
      </div>

      <!-- ===== SUMMARY BAR ===== -->
      <div class="summary-bar">
        <div class="summary-card glass-card">
          <div class="sum-icon">📦</div>
          <div>
            <div class="sum-val">{{ totalAvailable }}</div>
            <div class="sum-label">Total Available</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">🔒</div>
          <div>
            <div class="sum-val" style="color:#f1c40f">{{ totalReserved }}</div>
            <div class="sum-label">Total Reserved</div>
          </div>
        </div>
        <div class="summary-card glass-card">
          <div class="sum-icon">🏢</div>
          <div>
            <div class="sum-val" style="color:#2ed573">{{ inventories.length }}</div>
            <div class="sum-label">Inventory Lines</div>
          </div>
        </div>
      </div>

      <!-- ===== INVENTORY TABLE ===== -->
      <div class="glass-card table-card">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Stock Health</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of inventories" class="table-row">
                <td class="product-cell">
                  <div class="product-name">{{ inv.product?.name || 'Unknown' }}</div>
                  <div class="product-cat">{{ inv.product?.subcategory?.name || '' }}</div>
                </td>
                <td><span class="sku-badge">{{ inv.product?.sku || '—' }}</span></td>
                <td>
                  <div class="warehouse-name">{{ inv.warehouse?.name || 'Unknown' }}</div>
                  <div class="warehouse-loc">{{ inv.warehouse?.location || '' }}</div>
                </td>
                <td>
                  <span class="qty-val available" [class.low]="inv.availableQuantity < 10">
                    {{ inv.availableQuantity }}
                  </span>
                </td>
                <td>
                  <span class="qty-val reserved">{{ inv.reservedQuantity }}</span>
                </td>
                <td>
                  <div class="health-bar-wrap">
                    <div class="health-bar">
                      <div class="health-fill"
                        [style.width.%]="getHealthPct(inv)"
                        [class.low]="inv.availableQuantity < 10"
                        [class.med]="inv.availableQuantity >= 10 && inv.availableQuantity < 50">
                      </div>
                    </div>
                    <span class="health-label" [class.danger]="inv.availableQuantity < 10">
                      {{ inv.availableQuantity < 10 ? 'LOW' : inv.availableQuantity < 50 ? 'MEDIUM' : 'GOOD' }}
                    </span>
                  </div>
                </td>
                <td class="date-cell">{{ inv.updatedAt | date:'MMM d, HH:mm' }}</td>
              </tr>
              <tr *ngIf="inventories.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-icon">📭</div>
                  <p>No inventory records found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== MOVE STOCK MODAL ===== -->
    <div class="modal-overlay" *ngIf="isMoveModalOpen" (click)="closeMoveModal()">
      <div class="modal-box glass-card fade-in-up" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>🔄 Move Stock</h3>
            <p>Transfer available units between warehouses</p>
          </div>
          <button class="btn-close" (click)="closeMoveModal()">✕</button>
        </div>

        <form (ngSubmit)="onTransfer()">
          <div class="form-group">
            <label>Product</label>
            <select [(ngModel)]="transferReq.productId" name="txProduct" required class="select-field">
              <option value="" disabled selected>Select a product...</option>
              <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>From Warehouse</label>
              <select [(ngModel)]="transferReq.fromWarehouseId" name="txFrom" required class="select-field">
                <option value="" disabled selected>Source...</option>
                <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div class="arrow-icon">→</div>
            <div class="form-group">
              <label>To Warehouse</label>
              <select [(ngModel)]="transferReq.toWarehouseId" name="txTo" required class="select-field">
                <option value="" disabled selected>Destination...</option>
                <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Quantity to Move</label>
            <input type="number" min="1" [(ngModel)]="transferReq.quantity" name="txQty" required placeholder="e.g. 50">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-ghost" (click)="closeMoveModal()">Cancel</button>
            <button type="submit" class="btn-primary">Transfer Stock 🔄</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== RECEIVE STOCK MODAL ===== -->
    <div class="modal-overlay" *ngIf="isReceiveModalOpen" (click)="closeReceiveModal()">
      <div class="modal-box glass-card fade-in-up" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>📥 Receive Stock</h3>
            <p>Add new stock into a warehouse</p>
          </div>
          <button class="btn-close" (click)="closeReceiveModal()">✕</button>
        </div>

        <form (ngSubmit)="onReceive()">
          <div class="form-group">
            <label>Product</label>
            <select [(ngModel)]="receiveReq.productId" name="rcvProduct" required class="select-field">
              <option value="" disabled selected>Select a product...</option>
              <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Warehouse</label>
            <select [(ngModel)]="receiveReq.warehouseId" name="rcvWarehouse" required class="select-field">
              <option value="" disabled selected>Select warehouse...</option>
              <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity Received</label>
            <input type="number" min="1" [(ngModel)]="receiveReq.quantity" name="rcvQty" required placeholder="e.g. 100">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-ghost" (click)="closeReceiveModal()">Cancel</button>
            <button type="submit" class="btn-primary">Add Stock 📥</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .inv-page { padding-bottom: 3rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-title { color: white; font-size: 2.2rem; margin: 0; }
    .page-sub { color: var(--text-muted); margin: 0.25rem 0 0 0; }
    .action-group { display: flex; gap: 1rem; }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), #ff0055);
      color: white; border: none; padding: 0.8rem 1.5rem;
      border-radius: 10px; font-weight: 700; cursor: pointer;
      transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px var(--accent-glow); }
    .btn-secondary {
      background: transparent; color: #7bed9f;
      border: 1px solid #7bed9f; padding: 0.8rem 1.5rem;
      border-radius: 10px; font-weight: 700; cursor: pointer;
      transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem;
    }
    .btn-secondary:hover { background: rgba(123, 237, 159, 0.1); box-shadow: 0 5px 15px rgba(123,237,159,0.3); }
    .toast {
      background: rgba(46, 213, 115, 0.15); border: 1px solid rgba(46,213,115,0.3);
      color: #2ed573; padding: 1rem 1.5rem; border-radius: 10px;
      margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;
      animation: slideDown 0.3s ease;
    }
    .toast.toast-error { background: rgba(255,71,87,0.15); border-color: rgba(255,71,87,0.3); color: #ff4757; }
    @keyframes slideDown { from { transform: translateY(-15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .summary-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .summary-card {
      padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1.5rem;
    }
    .sum-icon { font-size: 2rem; }
    .sum-val { font-size: 2rem; font-weight: 800; color: white; line-height: 1; }
    .sum-label { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .table-card { padding: 0; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th { text-align: left; padding: 1.25rem 1.5rem; color: var(--text-muted); font-weight: 600;
         text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;
         border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
    td { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
    .table-row { transition: background 0.2s; }
    .table-row:hover td { background: rgba(255,255,255,0.03); }
    .product-name { color: white; font-weight: 600; font-size: 1rem; }
    .product-cat { color: var(--text-muted); font-size: 0.8rem; margin-top: 2px; }
    .warehouse-name { color: white; font-weight: 500; }
    .warehouse-loc { color: var(--text-muted); font-size: 0.8rem; margin-top: 2px; }
    .sku-badge { background: rgba(233,69,96,0.12); color: var(--accent); padding: 0.3rem 0.6rem;
                 border-radius: 5px; font-family: monospace; font-size: 0.85rem;
                 border: 1px solid rgba(233,69,96,0.25); }
    .qty-val { font-weight: 700; font-size: 1.15rem; }
    .qty-val.available { color: #2ed573; }
    .qty-val.available.low { color: #ff4757; }
    .qty-val.reserved { color: #f1c40f; }
    .health-bar-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .health-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
    .health-fill { height: 100%; background: #2ed573; border-radius: 99px; transition: width 0.5s ease; }
    .health-fill.med { background: #f1c40f; }
    .health-fill.low { background: #ff4757; }
    .health-label { font-size: 0.75rem; font-weight: 700; color: #2ed573; }
    .health-label.danger { color: #ff4757; }
    .date-cell { color: var(--text-muted); font-size: 0.9rem; }
    .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    /* Modals */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px); display: flex; justify-content: center;
      align-items: center; z-index: 200;
    }
    .modal-box { padding: 2.5rem; width: 100%; max-width: 540px; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .modal-header h3 { color: white; font-size: 1.5rem; margin: 0; }
    .modal-header p { color: var(--text-muted); margin: 0.25rem 0 0 0; font-size: 0.9rem; }
    .btn-close { background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; line-height: 1; padding: 0; transition: color 0.2s; }
    .btn-close:hover { color: white; }
    .form-group { margin-bottom: 1.25rem; }
    .form-row { display: flex; align-items: flex-end; gap: 0.75rem; margin-bottom: 1.25rem; }
    .form-row .form-group { flex: 1; margin-bottom: 0; }
    .arrow-icon { color: var(--accent); font-size: 1.5rem; font-weight: bold; padding-bottom: 0.5rem; flex-shrink: 0; }
    label { display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem; font-weight: 500; }
    input, .select-field {
      width: 100%; padding: 0.9rem 1rem; background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
      color: white; font-size: 0.95rem; box-sizing: border-box; transition: border-color 0.2s;
    }
    input:focus, .select-field:focus { outline: none; border-color: var(--accent); }
    .select-field { appearance: none; cursor: pointer; }
    .select-field option { background: #0f1015; color: white; }
    .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .btn-ghost { flex: 1; background: transparent; color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); padding: 0.9rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: white; }
    .modal-actions .btn-primary { flex: 2; justify-content: center; }
  `]
})
export class InventoryComponent implements OnInit {
  inventories: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];

  isMoveModalOpen = false;
  isReceiveModalOpen = false;

  transferReq = { productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: 1 };
  receiveReq = { productId: '', warehouseId: '', quantity: 1 };

  message = '';
  isError = false;

  constructor(
    private invService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private authService: AuthService
  ) {}

  get canManage(): boolean {
    const r = this.authService.getUserRole();
    return r === 'ADMIN' || r === 'WAREHOUSE_MANAGER';
  }

  get totalAvailable(): number {
    return this.inventories.reduce((s, i) => s + (i.availableQuantity || 0), 0);
  }

  get totalReserved(): number {
    return this.inventories.reduce((s, i) => s + (i.reservedQuantity || 0), 0);
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.invService.getInventories().subscribe({ next: d => this.inventories = d });
    this.productService.getProducts().subscribe({ next: d => this.products = d });
    this.warehouseService.getWarehouses().subscribe({ next: d => this.warehouses = d });
  }

  getHealthPct(inv: any): number {
    const total = (inv.availableQuantity || 0) + (inv.reservedQuantity || 0);
    if (total === 0) return 0;
    return Math.round((inv.availableQuantity / total) * 100);
  }

  openMoveModal() { this.isMoveModalOpen = true; }
  closeMoveModal() { this.isMoveModalOpen = false; this.transferReq = { productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: 1 }; }

  openReceiveModal() { this.isReceiveModalOpen = true; }
  closeReceiveModal() { this.isReceiveModalOpen = false; this.receiveReq = { productId: '', warehouseId: '', quantity: 1 }; }

  onTransfer() {
    if (this.transferReq.fromWarehouseId === this.transferReq.toWarehouseId) {
      this.showToast('Source and destination warehouses must be different', true);
      return;
    }
    this.invService.transferStock(this.transferReq).subscribe({
      next: () => {
        this.showToast(`✅ Stock transferred successfully!`);
        this.closeMoveModal();
        this.loadAll();
      },
      error: (err) => this.showToast(err?.error?.message || 'Transfer failed — check stock availability', true)
    });
  }

  onReceive() {
    this.invService.receiveStock(this.receiveReq as any).subscribe({
      next: () => {
        this.showToast('Stock received and added to inventory!');
        this.closeReceiveModal();
        this.loadAll();
      },
      error: (err) => this.showToast(err?.error?.message || 'Failed to receive stock', true)
    });
  }

  showToast(msg: string, err = false) {
    this.message = msg;
    this.isError = err;
    setTimeout(() => this.message = '', 4000);
  }
}

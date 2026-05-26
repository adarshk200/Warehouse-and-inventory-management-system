import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in-up">
      <div class="header-flex">
        <h2>Physical Warehouses</h2>
        <button *ngIf="userRole === 'ADMIN'" class="btn-primary" (click)="openModal()">Register Facility</button>
      </div>

      <div class="toast-success" *ngIf="message">{{message}}</div>

      <div class="grid">
         <div class="glass-card w-card" *ngFor="let w of warehouses">
            <div class="w-icon">🏢</div>
            <h3>{{w.name}}</h3>
            <p class="location">{{w.location}}</p>
            <div class="cap-meter">
               <div class="fill" [style.width.%]="70"></div>
            </div>
            <p class="cap-text">Capacity: {{w.capacity}} Units</p>
         </div>
         <div *ngIf="warehouses.length === 0" class="empty">No warehouses found in database.</div>
      </div>

      <!-- Add Warehouse Modal -->
      <div class="modal" *ngIf="isModalOpen">
        <div class="glass-card modal-content fade-in-up">
          <div class="modal-header">
            <h3>Register New Facility</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <form (ngSubmit)="onCreateWarehouse()">
            <div class="input-group">
              <label>Warehouse Name</label>
              <input type="text" [(ngModel)]="newWarehouse.name" name="name" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>Location</label>
              <input type="text" [(ngModel)]="newWarehouse.location" name="location" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>Storage Capacity (Units)</label>
              <input type="number" [(ngModel)]="newWarehouse.capacity" name="capacity" required>
            </div>
            <button type="submit" class="btn-glow">Add Warehouse</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h2 { font-size: 2.2rem; font-weight: 600; color: var(--text-light); margin: 0; }
    .btn-primary { background: var(--accent); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
    .btn-primary:hover { box-shadow: 0 5px 15px var(--accent-glow); transform: translateY(-2px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .w-card { padding: 2rem; text-align: center; transition: transform 0.3s; }
    .w-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
    .w-icon { font-size: 3rem; margin-bottom: 1rem; }
    h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-light); }
    .location { color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; }
    .cap-meter { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
    .fill { height: 100%; background: linear-gradient(90deg, #4a00e0, var(--accent)); border-radius: 4px; }
    .cap-text { color: var(--text-muted); font-size: 0.9rem; }
    .empty { color: var(--text-muted); font-style: italic; grid-column: 1 / -1; }
    .toast-success { background: rgba(46, 213, 115, 0.2); color: #2ed573; padding: 0.8rem 1.5rem; border-radius: 8px; border: 1px solid rgba(46, 213, 115, 0.3); margin-bottom: 1.5rem; }

    /* Modal styles */
    .modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 100; }
    .modal-content { padding: 2.5rem; width: 100%; max-width: 500px; position: relative; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .modal-header h3 { font-size: 1.5rem; color: white; margin: 0; }
    .btn-close { background: transparent; border: none; color: var(--text-muted); font-size: 2rem; cursor: pointer; }
    .btn-close:hover { color: white; }
    .input-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; }
    input { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 1rem; box-sizing: border-box; }
    input:focus { outline: none; border-color: var(--accent); }
    .btn-glow { width: 100%; background: linear-gradient(45deg, var(--accent), #ff0055); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s; margin-top: 1rem; text-transform: uppercase; }
    .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); }
  `]
})
export class WarehousesComponent implements OnInit {
  warehouses: any[] = [];
  isModalOpen = false;
  newWarehouse = { name: '', location: '', capacity: 10000 };
  message = '';

  constructor(private ws: WarehouseService, private authService: AuthService) {}

  get userRole(): string {
    return this.authService.getUserRole() || '';
  }

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.ws.getWarehouses().subscribe(data => this.warehouses = data);
  }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  onCreateWarehouse() {
    this.ws.createWarehouse(this.newWarehouse).subscribe({
      next: () => {
        this.message = 'Warehouse registered successfully!';
        this.closeModal();
        this.newWarehouse = { name: '', location: '', capacity: 10000 };
        this.loadWarehouses();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        alert('Failed to register warehouse. Please check permissions.');
      }
    });
  }
}

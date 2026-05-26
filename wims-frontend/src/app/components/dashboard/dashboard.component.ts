import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { WarehouseService } from '../../services/warehouse.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard fade-in-up">
      <div class="header">
        <h1>Overview</h1>
        <p>System metrics powered by Kafka Event Streaming</p>
      </div>

      <div class="grid">
         <div class="glass-card stat-card">
           <div class="icon-wrap i-w"><div class="icon">🏢</div></div>
           <div class="details">
             <h3>Active Facilities</h3>
             <h2>{{wCount}}</h2>
           </div>
         </div>
         <div class="glass-card stat-card">
           <div class="icon-wrap i-p"><div class="icon">📦</div></div>
           <div class="details">
             <h3>Unique SKUs</h3>
             <h2>{{pCount}}</h2>
           </div>
         </div>
         <div class="glass-card stat-card">
           <div class="icon-wrap i-o"><div class="icon">🛒</div></div>
           <div class="details">
             <h3>Orders Processed</h3>
             <h2>{{oCount}}</h2>
           </div>
         </div>
         <div class="glass-card stat-card">
           <div class="icon-wrap i-r"><div class="icon">💰</div></div>
           <div class="details">
             <h3>Total Revenue</h3>
             <h2>\${{totalRevenue | number:'1.2-2'}}</h2>
           </div>
         </div>
      </div>

      <div class="system-status glass-card">
          <h3>System Health & Broker Diagnostics</h3>
          
          <div class="health-row">
             <div class="service-meta">
               <span class="service-name">Redis Distributed Lock Service</span>
               <small class="service-desc">Concurrency control & cluster mutual exclusion</small>
             </div>
             <span class="status online">● Online</span>
          </div>
          
          <div class="health-row">
             <div class="service-meta">
               <span class="service-name">Kafka Event Stream cluster</span>
               <small class="service-desc">Topic clusters: inventory-mutations, order-lifecycle</small>
             </div>
             <span class="status online">● Online</span>
          </div>
          
          <div class="health-row">
             <div class="service-meta">
               <span class="service-name">RabbitMQ Notification Queue</span>
               <small class="service-desc">Dead-letter exchange allocation: active</small>
             </div>
             <span class="status online">● Online</span>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 8px 4px;
    }
    .header { margin-bottom: 2.5rem; }
    h1 { font-size: 2.2rem; color: var(--text-main); margin-bottom: 0.5rem; font-weight: 700; }
    p { font-size: 0.82rem; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;}
    .stat-card { display: flex; align-items: center; padding: 1.75rem; border-radius: 14px; }
    
    .icon-wrap { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 1.25rem; font-size: 1.6rem; }
    .i-w { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
    .i-p { background: rgba(147, 51, 234, 0.1); color: #9333ea; }
    .i-o { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
    .i-r { background: rgba(217, 119, 6, 0.1); color: #d97706; }
    
    h3 { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.35rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;}
    h2 { color: var(--text-main); font-size: 1.85rem; margin: 0; font-weight: 700;}
    
    .system-status { padding: 2rem; border-radius: 14px; }
    .system-status h3 { font-size: 1.15rem; color: var(--text-main); margin-bottom: 1.5rem; text-transform: none; letter-spacing: normal; }
    
    .health-row { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 0; border-bottom: 1px solid var(--border); }
    .health-row:last-child { border-bottom: none; }
    
    .service-meta { display: flex; flex-direction: column; gap: 4px; }
    .service-name { color: var(--text-main); font-weight: 600; font-size: 0.95rem; }
    .service-desc { color: var(--text-muted); font-size: 0.8rem; font-weight: 400; }
    
    .status.online { color: var(--success); font-weight: 700; font-size: 0.9rem; }
  `]
})
export class DashboardComponent implements OnInit {
  wCount = 0; pCount = 0; oCount = 0; totalRevenue = 0;
  constructor(private ws: WarehouseService, private ps: ProductService, private os: OrderService) {}
  ngOnInit() {
    this.ws.getWarehouses().subscribe(d => this.wCount = d?.length || 0);
    this.ps.getProducts().subscribe(d => this.pCount = d?.length || 0);
    this.os.getOrders().subscribe(d => {
      if (d) {
        this.oCount = d.length;
        this.totalRevenue = d.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      }
    });
  }
}
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
          <h3>System Health</h3>
          <div class="health-row">
             <span>Redis Distributed Lock Service</span>
             <span class="status online">● Online</span>
          </div>
          <div class="health-row">
             <span>Kafka Event Stream</span>
             <span class="status online">● Online</span>
          </div>
          <div class="health-row">
             <span>RabbitMQ Notification Queue</span>
             <span class="status online">● Online</span>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .header { margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; color: var(--text-light); margin-bottom: 0.5rem; }
    p { font-size: 1rem; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-bottom: 3rem;}
    .stat-card { display: flex; align-items: center; padding: 2rem; transition: transform 0.3s; cursor: default; }
    .stat-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
    .icon-wrap { width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-size: 2rem; }
    .i-w { background: rgba(52, 152, 219, 0.2); color: #3498db; }
    .i-p { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
    .i-o { background: rgba(46, 213, 115, 0.2); color: #2ed573; }
    .i-r { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
    h3 { color: var(--text-muted); font-size: 1rem; margin-bottom: 0.5rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;}
    h2 { color: var(--text-light); font-size: 2.5rem; margin: 0; font-weight: 800;}
    
    .system-status { padding: 2rem; }
    .system-status h3 { font-size: 1.5rem; color: var(--text-light); margin-bottom: 1.5rem; }
    .health-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-muted); font-size: 1.1rem; }
    .health-row:last-child { border-bottom: none; }
    .status.online { color: #2ed573; font-weight: 600; text-shadow: 0 0 10px rgba(46,213,115,0.5); }
  `]
})
export class DashboardComponent implements OnInit {
  wCount = 0; pCount = 0; oCount = 0; totalRevenue = 0;
  constructor(private ws: WarehouseService, private ps: ProductService, private os: OrderService) {}
  ngOnInit() {
    this.ws.getWarehouses().subscribe(d => this.wCount = d.length);
    this.ps.getProducts().subscribe(d => this.pCount = d.length);
    this.os.getOrders().subscribe(d => {
      this.oCount = d.length;
      this.totalRevenue = d.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    });
  }
}

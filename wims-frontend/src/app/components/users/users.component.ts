import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container fade-in-up">
      <div class="header-flex">
        <h2>User Management</h2>
        <button class="btn-primary" (click)="openModal()">Add User</button>
      </div>

      <div class="toast-success" *ngIf="message">{{message}}</div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users" class="table-row">
              <td class="bold-text">{{u.name}}</td>
              <td>{{u.email}}</td>
              <td><span class="badge" [class.badge-admin]="u.role==='ADMIN'" [class.badge-manager]="u.role==='WAREHOUSE_MANAGER'">{{u.role}}</span></td>
              <td>
                <button *ngIf="u.email !== 'admin@humancloud.com'" class="btn-danger" (click)="deleteUser(u.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add User Modal -->
      <div class="modal" *ngIf="isModalOpen">
        <div class="glass-card modal-content fade-in-up">
          <div class="modal-header">
            <h3>Register New User</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <form (ngSubmit)="onCreateUser()">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="newUser.name" name="name" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="newUser.email" name="email" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="newUser.password" name="password" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>System Role</label>
              <select [(ngModel)]="newUser.role" name="role" required>
                <option value="ADMIN">ADMIN</option>
                <option value="WAREHOUSE_MANAGER">WAREHOUSE MANAGER</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>
            <button type="submit" class="btn-glow">Create User Account</button>
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
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
    th { text-align: left; padding: 1rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    td { padding: 1.2rem 1rem; background: rgba(255,255,255,0.02); color: var(--text-light); }
    .table-row { transition: all 0.3s; }
    .table-row:hover td { background: rgba(255,255,255,0.05); }
    .bold-text { color: white; font-weight: 500; font-size: 1.1rem; }
    .badge { background: rgba(52, 152, 219, 0.2); color: #3498db; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: bold; border: 1px solid rgba(52, 152, 219, 0.4); }
    .badge-admin { background: rgba(233, 69, 96, 0.2); color: var(--accent); border-color: rgba(233, 69, 96, 0.4); }
    .badge-manager { background: rgba(241, 196, 15, 0.2); color: #f1c40f; border-color: rgba(241, 196, 15, 0.4); }
    .btn-danger { background: rgba(255, 71, 87, 0.1); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.3); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
    .btn-danger:hover { background: #ff4757; color: white; }
    
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
    input, select { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 1rem; box-sizing: border-box; }
    input:focus, select:focus { outline: none; border-color: var(--accent); }
    .btn-glow { width: 100%; background: linear-gradient(45deg, var(--accent), #ff0055); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s; margin-top: 1rem; text-transform: uppercase; }
    .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  isModalOpen = false;
  newUser = { name: '', email: '', password: '', role: 'STAFF' };
  message = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/v1/users').subscribe({
      next: data => this.users = data,
      error: () => alert('Access Denied. You do not have permission to view this page.')
    });
  }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  onCreateUser() {
    this.http.post('http://localhost:8080/api/v1/auth/register', this.newUser).subscribe({
      next: () => {
        this.message = 'User created successfully!';
        this.closeModal();
        this.newUser = { name: '', email: '', password: '', role: 'STAFF' };
        this.loadUsers();
        setTimeout(() => this.message = '', 3000);
      },
      error: err => {
        alert(err.error || 'Failed to register user.');
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://localhost:8080/api/v1/users/${id}`).subscribe({
        next: () => {
          this.message = 'User deleted successfully.';
          this.loadUsers();
          setTimeout(() => this.message = '', 3000);
        },
        error: () => alert('Failed to delete user.')
      });
    }
  }
}

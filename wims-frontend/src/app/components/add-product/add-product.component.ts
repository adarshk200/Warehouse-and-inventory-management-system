import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-wrapper">
      <div class="glass-card fade-in-up">
        <h2 class="glow-text">Register New Product</h2>
        <p class="subtitle">Data will be synchronized to MySQL and Redis Cache.</p>
        <form (ngSubmit)="onSubmit()">
          
          <div class="row">
            <div class="input-group">
              <label>SKU Identifier</label>
              <input type="text" [(ngModel)]="product.sku" name="sku" required placeholder="e.g. SKU-BOX-101" autocomplete="off">
            </div>
            <div class="input-group">
              <label>Product Name</label>
              <input type="text" [(ngModel)]="product.name" name="name" required placeholder="e.g. Storage Box" autocomplete="off">
            </div>
          </div>

          <div class="row">
            <div class="input-group">
              <label>Unit Price ($)</label>
              <input type="number" step="0.01" [(ngModel)]="product.price" name="price" required placeholder="0.00">
            </div>
            <div class="input-group">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" [(ngModel)]="product.weightKg" name="weightKg" required placeholder="0.0">
            </div>
          </div>

          <!-- Zoho Category/Subcategory Selectors -->
          <div class="row">
            <div class="input-group">
              <label>Category</label>
              <select [(ngModel)]="selectedCategoryId" (change)="onCategoryChange()" name="category" required class="select-field">
                <option value="" disabled selected>Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Subcategory</label>
              <select [(ngModel)]="selectedSubcategoryId" name="subcategory" [disabled]="!selectedCategoryId" required class="select-field">
                <option value="" disabled selected>Select Subcategory</option>
                <option *ngFor="let sub of subcategories" [value]="sub.id">{{ sub.name }}</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-glow" [disabled]="!selectedSubcategoryId">Synchronize to Database</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper { display: flex; justify-content: center; padding: 1rem 0; }
    .glass-card { padding: 3rem; width: 100%; max-width: 700px; }
    .glow-text { color: white; font-size: 2.2rem; margin-bottom: 0.5rem; text-shadow: 0 0 20px rgba(255,255,255,0.2); }
    .subtitle { color: var(--accent); margin-bottom: 2.5rem; }
    .input-group { margin-bottom: 1.5rem; flex: 1; text-align: left; }
    .row { display: flex; gap: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;}
    input, .select-field { width: 100%; padding: 1rem; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; font-size: 1.05rem; transition: all 0.3s; box-sizing: border-box; }
    input:focus, .select-field:focus { outline: none; border-color: var(--accent); background: rgba(0,0,0,0.4); box-shadow: 0 0 0 4px rgba(233, 69, 96, 0.15); }
    .select-field {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238b8d98' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down'%3E%3Cpath d='M6 9l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      cursor: pointer;
    }
    .select-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .select-field option {
      background: var(--bg-dark);
      color: white;
    }
    .btn-glow { width: 100%; background: linear-gradient(45deg, var(--accent), #ff0055); color: white; border: none; padding: 1.2rem; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; margin-top: 1rem; text-transform: uppercase; letter-spacing: 1px; }
    .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); }
    .btn-glow:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  `]
})
export class AddProductComponent implements OnInit {
  product = { sku: '', name: '', price: null, weightKg: null };
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategoryId = '';
  selectedSubcategoryId = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
  }

  onCategoryChange() {
    this.selectedSubcategoryId = '';
    this.subcategories = [];
    if (this.selectedCategoryId) {
      this.categoryService.getSubcategoriesByCategory(this.selectedCategoryId).subscribe(data => {
        this.subcategories = data;
      });
    }
  }

  onSubmit() {
    const payload = {
      ...this.product,
      subcategory: { id: this.selectedSubcategoryId }
    };
    this.productService.addProduct(payload).subscribe(() => {
      this.router.navigate(['/products']);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="category-container fade-in-up">
      <div class="header-section">
        <div>
          <h2 class="glow-text">Product Classification</h2>
          <p class="subtitle">Organize your inventory with Zoho-inspired Categories & Subcategories</p>
        </div>
        <div *ngIf="message" class="toast-message" [class.error]="isError">{{ message }}</div>
      </div>

      <div class="dashboard-grid">
        <!-- CATEGORIES COLUMN -->
        <div class="column-card glass-card">
          <div class="column-header">
            <h3>📁 Categories</h3>
            <button *ngIf="canEdit" class="btn-primary-sm" (click)="showCategoryForm = !showCategoryForm">
              {{ showCategoryForm ? 'Close' : '+ New Category' }}
            </button>
          </div>

          <!-- Add Category Form -->
          <div *ngIf="showCategoryForm" class="inline-form glass-card">
            <h4>Add New Category</h4>
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="newCategory.name" placeholder="e.g. Raw Materials">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newCategory.description" placeholder="Description of category..."></textarea>
            </div>
            <button class="btn-glow-sm" (click)="saveCategory()">Save Category</button>
          </div>

          <!-- Categories List -->
          <div class="list-wrapper">
            <div *ngFor="let cat of categories" 
                 class="item-card" 
                 [class.active]="selectedCategory?.id === cat.id"
                 (click)="selectCategory(cat)">
              <div class="item-info">
                <span class="item-title">{{ cat.name }}</span>
                <span class="item-desc">{{ cat.description }}</span>
              </div>
              <span class="chevron">❯</span>
            </div>
            <div *ngIf="categories.length === 0" class="empty-state">
              No categories found.
            </div>
          </div>
        </div>

        <!-- SUBCATEGORIES COLUMN -->
        <div class="column-card glass-card">
          <div class="column-header">
            <h3>🏷️ Subcategories</h3>
            <button *ngIf="canEdit && selectedCategory" class="btn-primary-sm" (click)="showSubcategoryForm = !showSubcategoryForm">
              {{ showSubcategoryForm ? 'Close' : '+ New Subcategory' }}
            </button>
          </div>

          <!-- Selected Category Indicator -->
          <div class="selected-indicator" *ngIf="selectedCategory">
            Selected: <strong>{{ selectedCategory.name }}</strong>
          </div>

          <!-- Add Subcategory Form -->
          <div *ngIf="showSubcategoryForm && selectedCategory" class="inline-form glass-card">
            <h4>Add Subcategory under {{ selectedCategory.name }}</h4>
            <div class="form-group">
              <label>Subcategory Name</label>
              <input type="text" [(ngModel)]="newSubcategory.name" placeholder="e.g. Copper wiring">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newSubcategory.description" placeholder="Description..."></textarea>
            </div>
            <button class="btn-glow-sm" (click)="saveSubcategory()">Save Subcategory</button>
          </div>

          <!-- Subcategories List -->
          <div class="list-wrapper">
            <ng-container *ngIf="selectedCategory; else selectPrompt">
              <div *ngFor="let sub of subcategories" class="item-card sub-card">
                <div class="item-info">
                  <span class="item-title">{{ sub.name }}</span>
                  <span class="item-desc">{{ sub.description }}</span>
                </div>
              </div>
              <div *ngIf="subcategories.length === 0" class="empty-state">
                No subcategories found under "{{ selectedCategory.name }}".
              </div>
            </ng-container>
            <ng-template #selectPrompt>
              <div class="select-prompt">
                <div class="prompt-icon">👈</div>
                <p>Select a category to view and manage its subcategories</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-container {
      padding: 1.5rem 0;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .glow-text {
      color: white;
      font-size: 2.2rem;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 0 20px rgba(255,255,255,0.2);
    }
    .subtitle {
      color: var(--text-muted);
      margin: 0;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .column-card {
      padding: 2rem;
      min-height: 450px;
      display: flex;
      flex-direction: column;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 0.75rem;
    }
    .column-header h3 {
      margin: 0;
      color: white;
      font-size: 1.4rem;
    }
    .btn-primary-sm {
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s;
    }
    .btn-primary-sm:hover {
      background: var(--accent);
      color: white;
      box-shadow: 0 0 10px var(--accent-glow);
    }
    .selected-indicator {
      background: rgba(233, 69, 96, 0.1);
      border: 1px solid rgba(233, 69, 96, 0.2);
      color: var(--text-light);
      padding: 0.6rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .selected-indicator strong {
      color: var(--accent);
    }
    .inline-form {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--glass-border);
    }
    .inline-form h4 {
      margin: 0 0 1rem 0;
      color: white;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
      letter-spacing: 0.5px;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      color: white;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    .form-group textarea {
      height: 60px;
      resize: vertical;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .btn-glow-sm {
      width: 100%;
      background: linear-gradient(45deg, var(--accent), #ff0055);
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      transition: all 0.3s;
    }
    .btn-glow-sm:hover {
      box-shadow: 0 5px 15px var(--accent-glow);
      transform: translateY(-1px);
    }
    .list-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
      max-height: 400px;
    }
    .item-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      padding: 1rem 1.25rem;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .item-card:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
      transform: translateX(4px);
    }
    .item-card.active {
      background: linear-gradient(90deg, rgba(233, 69, 96, 0.15), rgba(233,69,96,0.02));
      border-color: var(--accent);
    }
    .sub-card {
      cursor: default;
    }
    .sub-card:hover {
      transform: none;
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .item-title {
      color: white;
      font-weight: 600;
      font-size: 1.05rem;
    }
    .item-desc {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .chevron {
      color: var(--text-muted);
      font-size: 0.9rem;
      transition: color 0.3s;
    }
    .item-card.active .chevron {
      color: var(--accent);
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .select-prompt {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      padding: 2rem;
      text-align: center;
    }
    .prompt-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: float 2s infinite ease-in-out alternate;
    }
    .toast-message {
      background: rgba(46, 213, 115, 0.15);
      border: 1px solid rgba(46, 213, 115, 0.3);
      color: #2ed573;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease;
    }
    .toast-message.error {
      background: rgba(255, 71, 87, 0.15);
      border: 1px solid rgba(255, 71, 87, 0.3);
      color: #ff4757;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes float {
      from { transform: translateX(0); }
      to { transform: translateX(-8px); }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategory: any = null;

  // Forms
  showCategoryForm = false;
  showSubcategoryForm = false;
  newCategory = { name: '', description: '' };
  newSubcategory = { name: '', description: '' };

  message = '';
  isError = false;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  get canEdit(): boolean {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'WAREHOUSE_MANAGER';
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0 && !this.selectedCategory) {
          this.selectCategory(data[0]);
        }
      },
      error: (err) => this.showToast('Error loading categories', true)
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.showSubcategoryForm = false;
    this.loadSubcategories(category.id);
  }

  loadSubcategories(categoryId: string) {
    this.categoryService.getSubcategoriesByCategory(categoryId).subscribe({
      next: (data) => this.subcategories = data,
      error: (err) => this.showToast('Error loading subcategories', true)
    });
  }

  saveCategory() {
    if (!this.newCategory.name.trim()) {
      this.showToast('Category name is required', true);
      return;
    }
    this.categoryService.addCategory(this.newCategory).subscribe({
      next: (res) => {
        this.showToast('Category created successfully!');
        this.newCategory = { name: '', description: '' };
        this.showCategoryForm = false;
        this.loadCategories();
      },
      error: (err) => this.showToast('Failed to create category', true)
    });
  }

  saveSubcategory() {
    if (!this.newSubcategory.name.trim()) {
      this.showToast('Subcategory name is required', true);
      return;
    }
    const payload = {
      name: this.newSubcategory.name,
      description: this.newSubcategory.description,
      category: { id: this.selectedCategory.id }
    };
    this.categoryService.addSubcategory(payload).subscribe({
      next: (res) => {
        this.showToast('Subcategory created successfully!');
        this.newSubcategory = { name: '', description: '' };
        this.showSubcategoryForm = false;
        this.loadSubcategories(this.selectedCategory.id);
      },
      error: (err) => this.showToast('Failed to create subcategory', true)
    });
  }

  showToast(msg: string, isErr = false) {
    this.message = msg;
    this.isError = isErr;
    setTimeout(() => this.message = '', 4000);
  }
}

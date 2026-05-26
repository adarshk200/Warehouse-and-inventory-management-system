import { Routes } from '@angular/router';
import { InventoryComponent } from './components/inventory/inventory.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { LoginComponent } from './components/login/login.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { OrdersComponent } from './components/orders/orders.component';
import { UsersComponent } from './components/users/users.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { CustomersComponent } from './components/customers/customers.component';
import { ProcurementComponent } from './components/procurement/procurement.component';
import { ReturnsComponent } from './components/returns/returns.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SalesComponent } from './components/sales/sales.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
    { path: 'add-product', component: AddProductComponent, canActivate: [authGuard] },
    { path: 'warehouses', component: WarehousesComponent, canActivate: [authGuard] },
    { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
    { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
    { path: 'inventories', component: InventoryComponent, canActivate: [authGuard] },
    { path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard] },
    { path: 'customers', component: CustomersComponent, canActivate: [authGuard] },
    { path: 'procurement', component: ProcurementComponent, canActivate: [authGuard] },
    { path: 'returns', component: ReturnsComponent, canActivate: [authGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
    { path: 'sales', component: SalesComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'users', component: UsersComponent, canActivate: [authGuard] }
];

import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  // Add similar patterns for other features
  { path: 'categories', component: ProductListComponent }, // Placeholder
  { path: 'marketing-categories', component: ProductListComponent }, // Placeholder
  { path: 'orders', component: ProductListComponent }, // Placeholder
  { path: 'customer-messages', component: ProductListComponent }, // Placeholder
  { path: 'banners', component: ProductListComponent }, // Placeholder
];

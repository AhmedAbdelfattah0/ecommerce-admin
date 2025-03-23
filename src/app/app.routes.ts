import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { CategoriesListComponent } from './components/categories/categories-list/categories-list.component';
import { CategoryFormComponent } from './components/categories/category-form/category-form.component';
import { SubCategoriesListComponent } from './components/sub-categories/sub-categories-list/sub-categories-list.component';
import { SubCategoryFormComponent } from './components/sub-categories/sub-category-form/sub-category-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'categories', component: CategoriesListComponent },
  { path: 'categories/new', component: CategoryFormComponent },
  { path: 'categories/edit/:id', component: CategoryFormComponent },
  { path: 'sub-categories', component: SubCategoriesListComponent },
  { path: 'sub-categories/new', component: SubCategoryFormComponent },
  { path: 'sub-categories/edit/:id', component: SubCategoryFormComponent },
  // Add similar patterns for other features
  { path: 'marketing-categories', component: ProductListComponent }, // Placeholder
  { path: 'orders', component: ProductListComponent }, // Placeholder
  { path: 'customer-messages', component: ProductListComponent }, // Placeholder
  { path: 'banners', component: ProductListComponent }, // Placeholder
];

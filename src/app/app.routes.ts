import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    children: [
      { path: '', loadComponent: () => import('./components/products/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'new', loadComponent: () => import('./components/products/product-form/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./components/products/product-form/product-form.component').then(m => m.ProductFormComponent) }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    children: [
      { path: '', loadComponent: () => import('./components/categories/categories-list/categories-list.component').then(m => m.CategoriesListComponent) },
      { path: 'new', loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent) }
    ],
    canActivate: [AuthGuard]
  },
  // {
  //   path: 'sub-categories',
  //   children: [
  //     { path: '', loadComponent: () => import('./components/sub-categories/sub-categories-list/sub-categories-list.component').then(m => m.SubCategoriesListComponent) },
  //     { path: 'new', loadComponent: () => import('./components/sub-categories/sub-category-form/sub-category-form.component').then(m => m.SubCategoryFormComponent) },
  //     { path: 'edit/:id', loadComponent: () => import('./components/sub-categories/sub-category-form/sub-category-form.component').then(m => m.SubCategoryFormComponent) }
  //   ],
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'orders',
    children: [
      { path: '', loadComponent: () => import('./components/orders/order-list/order-list.component').then(m => m.OrderListComponent) },
      { path: ':id', loadComponent: () => import('./components/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent) }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    children: [
      { path: '', loadComponent: () => import('./components/messages/message-list/message-list.component').then(m => m.MessageListComponent) },
      { path: ':id', loadComponent: () => import('./components/messages/message-details/message-details.component').then(m => m.MessageDetailsComponent) }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'banners',
    children: [
      { path: '', loadComponent: () => import('./components/banners/banner-list/banner-list.component').then(m => m.BannerListComponent) },
      { path: 'new', loadComponent: () => import('./components/banners/banner-form/banner-form.component').then(m => m.BannerFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./components/banners/banner-form/banner-form.component').then(m => m.BannerFormComponent) }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'marketing-categories',
    children: [
      { path: '', loadComponent: () => import('./components/sub-categories/sub-categories-list/sub-categories-list.component').then(m => m.SubCategoriesListComponent) },
      { path: 'new', loadComponent: () => import('./components/sub-categories/sub-category-form/sub-category-form.component').then(m => m.SubCategoryFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./components/sub-categories/sub-category-form/sub-category-form.component').then(m => m.SubCategoryFormComponent) }
    ],
    canActivate: [AuthGuard]
   },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

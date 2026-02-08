import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { CategoriesListComponent } from './components/categories/categories-list/categories-list.component';
import { CategoryFormComponent } from './components/categories/category-form/category-form.component';
import { OrderListComponent } from './components/orders/order-list/order-list.component';
import { OrderDetailsComponent } from './components/orders/order-details/order-details.component';
import { CustomOrderListComponent } from './components/custom-orders/custom-order-list/custom-order-list.component';
import { CustomOrderDetailsComponent } from './components/custom-orders/custom-order-details/custom-order-details.component';
import { AppointmentsComponent } from './components/custom-orders/appointments/appointments.component';
import { AppointmentDetailsComponent } from './components/custom-orders/appointment-details/appointment-details.component';
import { MessageListComponent } from './components/messages/message-list/message-list.component';
import { MessageDetailsComponent } from './components/messages/message-details/message-details.component';
import { BannerListComponent } from './components/banners/banner-list/banner-list.component';
import { BannerFormComponent } from './components/banners/banner-form/banner-form.component';
import { SubCategoriesListComponent } from './components/sub-categories/sub-categories-list/sub-categories-list.component';
import { SubCategoryFormComponent } from './components/sub-categories/sub-category-form/sub-category-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    children: [
      { path: '', component: ProductListComponent },
      { path: 'new', component: ProductFormComponent },
      { path: 'edit/:id', component: ProductFormComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    children: [
      { path: '', component: CategoriesListComponent },
      { path: 'new', component: CategoryFormComponent },
      { path: 'edit/:id', component: CategoryFormComponent }
    ],
    canActivate: [AuthGuard]
  },

  {
    path: 'orders',
    children: [
      { path: '', component: OrderListComponent },
      { path: ':id', component: OrderDetailsComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'custom-orders',
    children: [
      { path: '', component: CustomOrderListComponent },
      { path: ':id', component: CustomOrderDetailsComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'appointments',
    children: [
      { path: '', component: AppointmentsComponent },
      { path: ':id', component: AppointmentDetailsComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    children: [
      { path: '', component: MessageListComponent },
      { path: ':id', component: MessageDetailsComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'banners',
    children: [
      { path: '', component: BannerListComponent },
      { path: 'new', component: BannerFormComponent },
      { path: 'edit/:id', component: BannerFormComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'marketing-categories',
    children: [
      { path: '', component: SubCategoriesListComponent },
      { path: 'new', component: SubCategoryFormComponent },
      { path: 'edit/:id', component: SubCategoryFormComponent }
    ],
    canActivate: [AuthGuard]
   },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

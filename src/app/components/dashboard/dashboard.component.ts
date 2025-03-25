import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dashboard metrics
  totalSales: number = 0;
  totalOrders: number = 0;
  averageOrder: number = 0;
  totalCategories: number = 0;
  totalMessages: number = 0;
  unreadMessages: number = 0;

  // Loading states
  isLoading = true;
  error: string | null = null;

  // Recent orders
  recentOrders: any[] = [];
  displayedColumns: string[] = ['id', 'date', 'customer', 'total', 'status'];

  // Recent messages
  recentMessages: any[] = [];

  dashboardData: any = {
    total_orders: 0,
    total_sales: '0',
    new_messages: 0,
    total_categories: 0,
    top_category: '',
    top_products: [],
    recent_orders: []
  };

  private subscription: Subscription | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.subscription = this.dashboardService.getDashboardData().subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.dashboardData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  getStatusText(statusId: number): string {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'Processing';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getStatusClass(statusId: number): string {
    switch (statusId) {
      case 1: return 'pending';
      case 2: return 'processing';
      case 3: return 'completed';
      case 4: return 'cancelled';
      default: return '';
    }
  }
}

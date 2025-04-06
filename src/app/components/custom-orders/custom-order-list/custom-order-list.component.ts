import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';

import { CustomOrderService } from '../../../services/orders/custom-order.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';

interface CustomOrderListItem {
  id: number;
  save_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  total: number | null;
}

@Component({
  selector: 'app-custom-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    BreadcrumbComponent
  ],
  templateUrl: './custom-order-list.component.html',
  styleUrls: ['./custom-order-list.component.scss']
})
export class CustomOrderListComponent implements OnInit {
  dataSource = new MatTableDataSource<CustomOrderListItem>([]);
  displayedColumns: string[] = ['id', 'save_code', 'customer_name', 'status', 'created_at', 'total', 'actions'];
  loading = false;
  error = '';
  statusFilter = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Custom Orders', url: '/custom-orders' }
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'priced', label: 'Priced' },
    { value: 'approved', label: 'Approved' },
    { value: 'in-progress', label: 'In Production' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private customOrderService: CustomOrderService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.loadCustomOrders();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCustomOrders() {
    this.loading = true;
    this.error = '';

    this.customOrderService.getCustomOrders()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (orders) => {
          this.dataSource.data = orders;
          this.applyFilters();
        },
        error: (err) => {
          this.error = 'Failed to load custom orders: ' + err.message;
          // this.toasterService.showError('Error', 'Failed to load custom orders');
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter() {
    this.applyFilters();
  }

  private applyFilters() {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchMatch = !filter ||
        data.save_code.toLowerCase().includes(filter.toLowerCase()) ||
        data.customer_name.toLowerCase().includes(filter.toLowerCase()) ||
        data.customer_email.toLowerCase().includes(filter.toLowerCase()) ||
        data.customer_phone.toLowerCase().includes(filter.toLowerCase());

      const statusMatch = !this.statusFilter || data.status === this.statusFilter;

      return searchMatch && statusMatch;
    };

    // Trigger filter
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'priced': return 'status-priced';
      case 'approved': return 'status-approved';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}

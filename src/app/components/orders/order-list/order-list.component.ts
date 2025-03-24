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
import { OrderService } from '../../../services/orders/order.service';
import { OrderListItem } from '../../../models/order';
import { OrderStatus } from '../../../models/order-status';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { MatTableDataSource } from '@angular/material/table';
import { AddSpaceAfterCurrencyPipe } from '../../../common/pipes/add-space-after-currency';
import { finalize } from 'rxjs/operators';
import { ToasterService } from '../../../services/toatser.service';

@Component({
  selector: 'app-order-list',
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
    BreadcrumbComponent,

  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'phoneNumber', 'date', 'status', 'statusAr', 'actions'];
  dataSource!: MatTableDataSource<OrderListItem>;
  orders: OrderListItem[] = [];
  orderStatuses: OrderStatus[] = [];
  isLoading = false;
  searchText = '';
  selectedStatus: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Orders' }
  ];

  constructor(
    private orderService: OrderService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.loadOrderStatuses();
    this.loadOrders();
  }

  loadOrderStatuses(): void {
    this.orderService.getOrderStatuses().subscribe({
      next: (data) => {
        this.orderStatuses = data;
      },
      error: (error) => {
        console.error('Error loading order statuses:', error);
        this.toasterService.openToaster({
          message: 'Failed to load order statuses',
          type: 'error'
        });
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.initializeDataSource();
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.toasterService.openToaster({
            message: 'Failed to load orders. Please try again.',
            type: 'error'
          });
        }
      });
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.orders);
    // Set up sorting and pagination after view init
    setTimeout(() => {
      if (this.sort && this.paginator) {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        // Add custom sorting data accessor
        this.dataSource.sortingDataAccessor = (item: OrderListItem, property: string) => {
          switch (property) {
            case 'id':
              return Number(item.id);
            case 'date':
              const date = item.date || item.created_at;
              return date ? new Date(date).getTime() : 0;
            case 'status':
              return item.statusName || item.statusLabel || '';
            case 'statusAr':
              return item.statusNameAr || '';
            case 'name':
              return item.name || '';
            case 'email':
              return item.email || '';
            case 'phoneNumber':
              return item.phoneNumber || '';
            default:
              return '';
          }
        };
      }
    });
  }

  applyFilter(): void {
    // If we have searchText, create a filter function
    if (this.searchText || this.selectedStatus) {
      this.dataSource.filterPredicate = this.createFilterPredicate();
      this.dataSource.filter = 'custom-filter';
    } else {
      this.dataSource.filter = '';
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = null;
    this.applyFilter();
  }

  private createFilterPredicate(): (data: OrderListItem, filter: string) => boolean {
    return (data: OrderListItem, filter: string): boolean => {
      // Filter by search text if provided
      const matchesSearch = !this.searchText ||
        data.id.toString().includes(this.searchText) ||
        data.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        data.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        data.phoneNumber.includes(this.searchText);
      // Filter by status if selected
      const matchesStatus = !this.selectedStatus || data.statusId.toString() === this.selectedStatus.toString();

      // Return true only if both conditions are met
      return matchesSearch && matchesStatus;
    };
  }

  getStatusChipClass(statusId: string): string {
    switch (statusId) {
      case '1': return 'status-delivered';
      case '2': return 'status-pending';
      case '3': return 'status-confirmed';
      case '4': return 'status-processing';
      case '5': return 'status-shipped';
      case '6': return 'status-out-for-delivery';
      case '7': return 'status-canceled';
      case '8': return 'status-returned';
      case '9': return 'status-refunded';
      case '10': return 'status-failed';
      case '11': return 'status-on-hold';
      case '12': return 'status-partially-shipped';
      case '13': return 'status-awaiting-payment';
      default: return 'status-default';
    }
  }
}

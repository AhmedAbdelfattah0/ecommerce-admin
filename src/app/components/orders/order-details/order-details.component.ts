import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../../services/orders/order.service';
import { Order, OrderItem } from '../../../models/order';
import { OrderStatus } from '../../../models/order-status';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { finalize } from 'rxjs/operators';
import { AddSpaceAfterCurrencyPipe } from "../../../common/pipes/add-space-after-currency";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { toasterCases } from '../../../common/constants/app.constants';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    BreadcrumbComponent,
    AddSpaceAfterCurrencyPipe
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  orderStatuses: OrderStatus[] = [];
  isLoading = false;
  isSaving = false;
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total'];
  selectedStatus: string = '';
  error: string | null = null;
  orderItems: OrderItem[] = [];

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Orders', url: '/orders' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private toasterService: ToasterService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadOrderStatuses();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(id);
    } else {
      this.router.navigate(['/orders']);
    }
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

  loadOrderDetails(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrder(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.order = data;
          this.selectedStatus = data.statusId.toString();

          // Process order items - support both old and new data structures
          if (data.products && data.products.length > 0) {
            this.orderItems = data.products;
          } else if (data.items && data.items.length > 0) {
            this.orderItems = data.items;
          } else {
            this.orderItems = [];
          }

          // Update breadcrumbs
          if (this.breadcrumbItems.length === 2) {
            this.breadcrumbItems.push({ label: `Order #${data.id}` });
          } else {
            this.breadcrumbItems[2] = { label: `Order #${data.id}` };
          }
        },
        error: (error) => {
          console.error('Error loading order details:', error);
          this.error = 'Failed to load order details. Please try again.';
          this.toasterService.openToaster({
            message: this.error,
            type: 'error'
          });
        }
      });
  }

  updateOrderStatus(): void {
    if (!this.order || this.selectedStatus === this.order.statusId.toString()) {
      return;
    }

    const currentStatus = this.orderStatuses.find(s => s.id === this.order?.statusId.toString())?.status || '';
    const newStatus = this.orderStatuses.find(s => s.id === this.selectedStatus)?.status || '';

    const dialogData: ConfirmationDialogData = {
      title: 'Update Order Status',
      message: `Are you sure you want to change the order status from "${currentStatus}" to "${newStatus}"?`,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel'
    };

    this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result && this.order) {
        this.isSaving = true;
        this.orderService.updateOrderStatus(this.order.id.toString(), this.selectedStatus)
          .pipe(finalize(() => this.isSaving = false))
          .subscribe({
            next: (updatedOrder) => {
              if (!updatedOrder) return;
              this.loadOrderDetails(this.order!.id.toString());
              // Update the displayed products/items
              if (updatedOrder.products && updatedOrder.products.length > 0) {
                this.orderItems = updatedOrder.products;
              } else if (updatedOrder.items && updatedOrder.items.length > 0) {
                this.orderItems = updatedOrder.items;
              }
              this.toasterService.openToaster(toasterCases.ORDER_STATUS_UPDATED);
            },
            error: (error) => {
              console.error('Error updating order status:', error);
              this.selectedStatus = this.order!.statusId.toString(); // Reset to original

            }
          });
      } else {
        // Reset selection if cancelled
        this.selectedStatus = this.order?.statusId.toString() || '';
      }
    });
  }

  getStatusChipClass(statusId: number): string {
    switch (statusId.toString()) {
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

  printOrder(): void {
    window.print();
  }

  tryAgain(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(id);
    }
  }

  getProductPrice(item: OrderItem): number {
    return Number(item.discountedPrice) ? Number( item.discountedPrice) : Number(item.originalPrice) | 0 ;
  }

  getProductQuantity(item: OrderItem): number {
    return  Number(item.qty) || 0;
  }

  getProductTotal(item: OrderItem): number {
    const price = this.getProductPrice(item);
    debugger
    const quantity = this.getProductQuantity(item);
    return price * quantity;
  }

  calculateSubtotal(): number {
    if (!this.orderItems || this.orderItems.length === 0) {
      return 0;
    }

    return this.orderItems.reduce((total, item) => {
      return total + this.getProductTotal(item);
    }, 0);
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const shipping = Number(this.order?.shippingCost) || 0;
    const discount = Number(this.order?.discount) || 0;

    return subtotal + shipping - discount;
  }
}

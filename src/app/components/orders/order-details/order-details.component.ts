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

    // Blur any active element to prevent focus retention issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const currentStatus = this.orderStatuses.find(s => s.id === this.order?.statusId.toString())?.status || '';
    const newStatus = this.orderStatuses.find(s => s.id === this.selectedStatus)?.status || '';

    const dialogData: ConfirmationDialogData = {
      title: 'Update Order Status',
      message: `Are you sure you want to change the order status from "${currentStatus}" to "${newStatus}"?`,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel'
    };

    // Use setTimeout to ensure the blur has taken effect before opening the dialog
    setTimeout(() => {
      this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: dialogData,
        autoFocus: false // Prevent automatic focus which can cause ARIA issues
      }).afterClosed().subscribe(result => {
        if (result && this.order) {
          this.isSaving = true;
          this.orderService.updateOrderStatus(this.order.id.toString(), this.selectedStatus)
            .pipe(finalize(() => this.isSaving = false))
            .subscribe({
              next: (updatedOrder) => {
                if (!updatedOrder) return;

                // Completely reload the order details instead of partial updates
                this.loadOrderDetails(this.order!.id.toString());
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
    }, 0);
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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Format the date
    const orderDate = this.order?.date && this.order.date !== '0000-00-00'
      ? new Date(this.order.date)
      : this.order?.created_at
        ? new Date(this.order.created_at)
        : new Date();

    // Generate the print-specific HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${this.order?.id} - Print View</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 30px;
              break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .detail-row {
              margin-bottom: 10px;
            }
            .detail-label {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .order-summary {
              border: 1px solid #ddd;
              padding: 15px;
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .total-row {
              font-weight: bold;
              font-size: 16px;
              border-top: 2px solid #ddd;
              padding-top: 10px;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            @media print {
              .section {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Order #${this.order?.id}</h1>
            <p>Date: ${orderDate.toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-grid">
              <div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span>${this.order?.statusName || this.order?.status || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-grid">
              <div>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span>${this.order?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span>${this.order?.email || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${this.order?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
              <div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span>${this.order?.address || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">State:</span>
                  <span>${this.order?.state || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${this.orderItems.map(item => `
                  <tr>
                    <td>${item.title || item.name || item.productName || 'N/A'}</td>
                    <td>${this.getProductPrice(item) > 0 ? this.formatCurrency(this.getProductPrice(item)) : 'N/A'}</td>
                    <td>${this.getProductQuantity(item) || 'N/A'}</td>
                    <td>${this.getProductTotal(item) > 0 ? this.formatCurrency(this.getProductTotal(item)) : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="order-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${this.formatCurrency(this.calculateSubtotal())}</span>
              </div>
              ${this.order?.shippingCost ? `
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>${this.formatCurrency(this.order.shippingCost)}</span>
                </div>
              ` : ''}
              <div class="summary-row total-row">
                <span>Total:</span>
                <span>${this.formatCurrency(this.calculateTotal())}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  tryAgain(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(id);
    }
  }

  getProductPrice(item: OrderItem): number {
    if (!item) return 0;
    // Parse each value as a number, default to 0 if NaN
    const discounted = parseFloat(String(item.discountedPrice)) || 0;
    const original = parseFloat(String(item.originalPrice)) || 0;
    const price = parseFloat(String(item.price)) || 0;

    // Return the first non-zero value
    return discounted || original || price;
  }

  getProductQuantity(item: OrderItem): number {
    if (!item) return 0;
    // Parse each value as a number, default to 0 if NaN
    const qty = parseFloat(String(item.qty)) || 0;
    const quantity = parseFloat(String(item.quantity)) || 0;

    return qty || quantity;
  }

  getProductTotal(item: OrderItem): number {
    if (!item) return 0;
    const price = this.getProductPrice(item);
    const quantity = this.getProductQuantity(item);
    return price * quantity;
  }

  calculateSubtotal(): number {
    if (!this.orderItems || this.orderItems.length === 0) {
      return 0;
    }

    // Use a pure reduce function that doesn't modify component state
    return this.orderItems.reduce((total, item) => {
      return total + this.getProductTotal(item);
    }, 0);
  }

  calculateTotal(): number {
    // Get the subtotal using the pure function
    const subtotal = this.calculateSubtotal();

    // Parse values as numbers with proper error handling
    const shipping = this.parseShippingCost();
    const discount = this.parseDiscount();

    // Return the calculated total without modifying component state
    return subtotal + shipping - discount;
  }

  // Helper methods for the template to avoid linter errors
  parseShippingCost(): number {
    return parseFloat(String(this.order?.shippingCost)) || parseFloat(String(this.order?.shipping)) || 0;
  }

  parseDiscount(): number {
    return parseFloat(String(this.order?.discount)) || 0;
  }

  hasDiscount(): boolean {
    return this.parseDiscount() > 0;
  }
}

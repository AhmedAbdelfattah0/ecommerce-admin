import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Order, OrderListItem } from '../../models/order';
import { OrderStatus, ORDER_STATUSES } from '../../models/order-status';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl ='/orders';

  constructor(private http: HttpClient) { }

  // Get all orders
  getOrders(): Observable<OrderListItem[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/get_orders.php`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data
        }
        return [];
      }),
      catchError(this.handleError<OrderListItem[]>('getOrders', []))
    );
  }

  // Get order by ID
  getOrder(id: string): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/get_order.php?id=${id}`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return this.enrichOrderWithStatusLabels(response.data);
        }
        throw new Error(response.message || 'Order not found');
      }),
      catchError(this.handleError<Order>('getOrder'))
    );
  }

  // Enrich order with status labels if they're not set
  private enrichOrderWithStatusLabels(order: Order): Order {
    const statusId = order.statusId.toString();

    if (!order.statusName) {
      order.statusName = this.getStatusLabel(statusId);
    }

    if (!order.statusNameAr) {
      order.statusNameAr = this.getStatusLabelAr(statusId);
    }

    // Handle products array if it exists
    if (order.products && order.products.length) {
      order.items = order.products;
    }

    return order;
  }

  // Update order status
  updateOrderStatus(orderId: string, statusId: string): Observable<any> {


    return this.http.post<any>(`${this.apiUrl}/update_order.php`, {id:orderId, statusId:statusId}).pipe(
      map(response => {
        if (response && response.status  ) {
          return statusId;
        }
        throw new Error(response.message || 'Failed to update order status');
      }),
      catchError(this.handleError<Order>('updateOrderStatus'))
    );
  }

  // Get all available order statuses
  getOrderStatuses(): Observable<OrderStatus[]> {
    // If there's no API endpoint for statuses, use the predefined ones
    return this.http.get<ApiResponse<OrderStatus[]>>(`/status/get_status_list.php`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data;
        }
        return ORDER_STATUSES; // Fallback to predefined statuses if API fails
      }),
      catchError(error => {
        console.error('Error fetching order statuses:', error);
        return [ORDER_STATUSES]; // Return predefined statuses on error
      })
    );
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error('Error details:', error);

      // Parse API error response if available
      let errorMessage = 'An error occurred';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      // You can add more specific error handling here based on error status codes
      if (error.status === 404) {
        console.error(`Resource not found during ${operation}`);
        errorMessage = 'The requested resource was not found';
      } else if (error.status === 403) {
        console.error(`Access denied during ${operation}`);
        errorMessage = 'You do not have permission to access this resource';
      }

      return throwError(() => new Error(errorMessage));
    };
  }

  // Helper method to get status label by id (used as fallback)
  private getStatusLabel(statusId: string): string {
    const status = ORDER_STATUSES.find(s => s.id === statusId);
    return status ? status.status : 'Unknown';
  }

  // Helper method to get status label in Arabic by id (used as fallback)
  private getStatusLabelAr(statusId: string): string {
    const status = ORDER_STATUSES.find(s => s.id === statusId);
    return status?.statusAr ?? 'غير معروف';
  }
}

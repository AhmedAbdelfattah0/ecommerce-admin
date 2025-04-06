import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class CustomOrderService {
  private apiUrl = '/orders';

  constructor(private http: HttpClient) { }

  // Get all custom orders
  getCustomOrders(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/get_custom_orders.php`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError<any[]>('getCustomOrders', []))
    );
  }

  // Get custom order by ID
  getCustomOrder(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/get_custom_order.php?id=${id}`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Order not found');
      }),
      catchError(this.handleError<any>('getCustomOrder'))
    );
  }

  // Update custom order pricing
  updateCustomOrderPricing(orderId: string, pricing: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/update_custom_order_pricing.php`, {
      orderId: orderId,
      pricing: pricing
    }).pipe(
      map(response => {
        if (response && response.status) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update order pricing');
      }),
      catchError(this.handleError<any>('updateCustomOrderPricing'))
    );
  }

  // Get all measurement appointments
  getMeasurementAppointments(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/get_measurement_appointments.php`).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError<any[]>('getMeasurementAppointments', []))
    );
  }

  // Update measurement appointment status
  updateAppointmentStatus(appointmentId: string, status: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/update_appointment_status.php`, {
      appointmentId: appointmentId,
      status: status
    }).pipe(
      map(response => {
        if (response && response.status) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update appointment status');
      }),
      catchError(this.handleError<any>('updateAppointmentStatus'))
    );
  }

  // Generate contract/agreement for custom order
  generateContract(orderId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/generate_contract.php?id=${orderId}`, {
      responseType: 'blob' as 'json'
    }).pipe(
      catchError(this.handleError<any>('generateContract'))
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

      // More specific error handling based on error status codes
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
}

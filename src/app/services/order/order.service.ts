import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderRequest } from '../../models/ create-order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/orders'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  createOrder(payload: CreateOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create_order.php`, payload);
  }
}

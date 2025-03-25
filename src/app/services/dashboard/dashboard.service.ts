import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';

export interface DashboardData {
  total_orders: number;
  total_sales: string;
  new_messages: number;
  total_categories: number;
  top_category: string;
  top_products: string[];
  recent_orders: Array<{
    id: number;
    customer_name: string;
    phoneNumber: string;
    statusId: number;
    created_at: string;
    address: string;
    state: string;
    email: string;
    total_amount: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashbord-info.php`);
  }
}

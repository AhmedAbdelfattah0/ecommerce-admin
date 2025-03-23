import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';

@Injectable({
  providedIn: 'root'
})
export class CatigoryService {
 private apiUrl = '/categories'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  getCatigories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/get_categories.php`);
    }

}

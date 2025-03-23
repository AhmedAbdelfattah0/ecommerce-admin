import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubCategory } from '../../models/sub-category';

@Injectable({
  providedIn: 'root'
})
export class SuCategoriesService {
  private apiUrl = '/sub_categories'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }
  getSubCatigories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/get_subcategories.php`);
  }

}

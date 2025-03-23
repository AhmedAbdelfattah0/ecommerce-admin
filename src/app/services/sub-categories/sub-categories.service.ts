import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { SubCategory } from '../../models/sub-category';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriesService {
  private apiUrl = '/sub_categories'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  // Get all sub-categories
  getSubCategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/get_subcategories.php`)
      .pipe(catchError(this.handleError<SubCategory[]>('getSubCategories')));
  }

  // Get sub-categories by category ID
  getSubCategoriesById(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/get_subcategory.php?categoryId=${categoryId}`)
      .pipe(catchError(this.handleError<SubCategory[]>('getSubCategoriesByCategoryId')));
  }

  // Get sub-category by ID
  getSubCategory(id: number): Observable<SubCategory> {
    return this.http.get<SubCategory>(`${this.apiUrl}/get_subcategory.php?id=${id}`)
      .pipe(catchError(this.handleError<SubCategory>('getSubCategory')));
  }

  // Create a new sub-category
  createSubCategory(subCategory: SubCategory): Observable<SubCategory> {
    return this.http.post<SubCategory>(`${this.apiUrl}/create_subcategory.php`, subCategory)
      .pipe(catchError(this.handleError<SubCategory>('createSubCategory')));
  }

  // Update an existing sub-category
  updateSubCategory(subCategory: SubCategory): Observable<SubCategory> {
    return this.http.put<SubCategory>(`${this.apiUrl}/update_subcategory.php`, subCategory)
      .pipe(catchError(this.handleError<SubCategory>('updateSubCategory')));
  }

  // Delete a sub-category
  deleteSubCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete_subcategory.php`, {body:{id: id}})
      .pipe(catchError(this.handleError<any>('deleteSubCategory')));
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error('Error details:', error);
      return throwError(() => error);
    };
  }
}

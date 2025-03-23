import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Category } from '../../models/category';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatigoryService {
  private apiUrl = '/categories'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  // Get all categories
  getCatigories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/get_categories.php`)
      .pipe(catchError(this.handleError<Category[]>('getCatigories')));
  }

  // Get category by ID
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/get_category.php?id=${id}`)
      .pipe(catchError(this.handleError<Category>('getCategory')));
  }

  // Create a new category
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/add_category.php`, category)
      .pipe(catchError(this.handleError<Category>('createCategory')));
  }

  // Update an existing category
  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/update_category.php`, category)
      .pipe(catchError(this.handleError<Category>('updateCategory')));
  }

  // Delete a category
  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete_category.php`, {body:{id: id}})
      .pipe(catchError(this.handleError<any>('deleteCategory')));
  }

  // Error handling
/**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
private handleError<T>(operation = 'operation', result?: T) {
  return (error: HttpErrorResponse): Observable<T> => {
    console.error(`${operation} failed: ${error.message}`);

    // Log the error to an error reporting service
    console.error('Error details:', error);

    // Return the error to the subscriber
    return throwError(() => error);
  };
}
}

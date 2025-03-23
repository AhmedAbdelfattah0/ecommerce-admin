import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { Product, ProductsResponse } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/products'; // Replace with your actual API endpoint
  isProductsLoading = signal(false);

  // Mock data for testing when API fails

  constructor(private http: HttpClient) { }

  getProducts(params?: {
    page: number,
    perPage: number,
    sort: string,
    filters: any
  }): Observable<any[]> {
    this.isProductsLoading.set(true);

    return this.http.get<any[]>(`${this.apiUrl}/get_products.php`, { params })
      .pipe(
        tap(() => console.log('Products fetched successfully')),
        catchError(this.handleError('getProducts', [])),
        delay(500), // Add small delay to show loading state
        tap(() => this.isProductsLoading.set(false))
      );
  }

  get_discounted_products(params?: {
    page: number,
    perPage: number,
    sort: string,
    filters: any
  }): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/get_discounted_products.php`, { params })
      .pipe(
        catchError(this.handleError('get_discounted_products', []))
      );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/get_product.php/?id=${id}`)
      .pipe(
        catchError(this.handleError<Product>('getProduct', {} as Product))
      );
  }

  getProductsByCategory(category: any): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/get_products_by_categoryId.php/?categoryId=${category}`)
      .pipe(
        catchError(this.handleError('getProductsByCategory', []))
      );
  }


  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/update_product.php`, product)
      .pipe(
        catchError(this.handleError('updateProduct', {} as Product))
      );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/create_product.php`, product)
      .pipe(
        catchError(this.handleError('createProduct', {} as Product))
      );
  }


  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete_product.php`, {body:{id:id}} ).pipe(
      catchError(this.handleError('deleteProduct', undefined))
    );
  }

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

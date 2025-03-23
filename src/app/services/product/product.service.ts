import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { Product, Product_v2, ProductsResponse } from '../../models/product';

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

  getProduct(id: number): Observable<Product_v2> {
    return this.http.get<Product_v2>(`${this.apiUrl}/get_product-v2.php/?id=${id}`)
      .pipe(
        catchError(this.handleError<Product_v2>('getProduct', {} as Product_v2))
      );
  }

  getProductsByCategory(category: any): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/get_products_by_categoryId.php/?categoryId=${category}`)
      .pipe(
        catchError(this.handleError('getProductsByCategory', []))
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

      // If this is a development environment, return mock data
      if (operation === 'getProducts') {
        console.log('Returning mock products data');
        return of([] as unknown as T);
      }

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}

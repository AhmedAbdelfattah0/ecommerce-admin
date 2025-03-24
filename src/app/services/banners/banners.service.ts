import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Banner } from '../../models/banner';
import { ApiResponse } from '../../models/api-response';

interface BannerFormData {
  id?: string;
  fileUrl: string;
  visible: boolean;
  selected: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private apiUrl = '/banners';

  constructor(private http: HttpClient) {}

  getBanners(): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.apiUrl}/get_banners.php`)
      .pipe(catchError(this.handleError));
  }

  getBanner(id: number): Observable<ApiResponse<Banner>> {
    return this.http.get<ApiResponse<Banner>>(`${this.apiUrl}/get_banner.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createBanner(bannerData: BannerFormData): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>(`${this.apiUrl}/create_banner.php`, bannerData)
      .pipe(catchError(this.handleError));
  }

  updateBanner(bannerData: BannerFormData): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>(`${this.apiUrl}/update_banner.php`, bannerData)
      .pipe(catchError(this.handleError));
  }

  updateBannerVisibility(updateData: { id: number; visible: boolean; selected: boolean }): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>(`${this.apiUrl}/update_banner_visibility.php`, updateData)
      .pipe(catchError(this.handleError));
  }

  deleteBanner(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete_banner.php`,{body:{id:id}})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

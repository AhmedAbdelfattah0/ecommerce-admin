import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '../../models/message';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiUrl = '/messages';

  constructor(private http: HttpClient) {}

  getMessages(): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/get_messages.php`)
      .pipe(catchError(this.handleError<ApiResponse<Message[]>>('getMessages')));
  }

  getMessage(id: number): Observable<ApiResponse<Message>> {
    return this.http.get<ApiResponse<Message>>(`${this.apiUrl}/get_message.php?id=${id}`)
      .pipe(catchError(this.handleError<ApiResponse<Message>>('getMessage')));
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  private apiUrl = '/messages'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  sendMessage(payload: Observable<any>) {
    return this.http.post<any>(`${this.apiUrl}/create_message.php`, payload);
  }
}

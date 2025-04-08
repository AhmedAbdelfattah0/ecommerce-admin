import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { ToastrService } from 'ngx-toastr';

interface NotificationResponse {
  status: boolean;
  message: string;
  data: {
    notifications: Notification[];
  };
}

export interface Notification {
  id: number;
  type: 'order' | 'message' | 'appointment';
  message: string;
  created_at: string;
  is_read: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  startNotificationsCheck(): void {
    // Initial check
    this.checkNotifications().subscribe();

    // Start interval checks
    interval(this.CHECK_INTERVAL)
      .pipe(
        tap(() => this.checkNotifications().subscribe())
      )
      .subscribe();
  }

  checkNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`/notifications/get_notifications.php`).pipe(
      tap({
        next: (response) => {
          if (response.status && response.data.notifications) {
            const currentNotifications = this.notificationsSubject.getValue();
            const newNotifications = response.data.notifications.filter(
              notification => !currentNotifications.some(
                current => current.id === notification.id
              )
            );

            // Update notifications in subject
            this.notificationsSubject.next(response.data.notifications);

            // Update unread count
            this.countUnreadNotifications();

            // Show toaster for each new notification
            newNotifications.forEach(notification => {
              this.showNotificationToaster(notification);
            });
          }
        },
        error: (error) => {
          console.error('Error checking notifications:', error);
        }
      })
    );
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Observable of API response
   */
  markNotificationAsRead(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`/notifications/mark_as_read.php`, { id })
      .pipe(
        tap(() => {
          // Update local notifications list
          this.notificationsSubject.next(
            this.notificationsSubject.value.map(n =>
              n.id === id ? { ...n, is_read: 1 } : n
            )
          );
          // Update unread count
          this.countUnreadNotifications();
        }),
        catchError(error => {
          console.error('Error marking notification as read:', error);
          return of({ status: false, message: 'Failed to mark notification as read', data: null } as ApiResponse<any>);
        })
      );
  }

  /**
   * Count unread notifications and update the unread count subject
   */
  private countUnreadNotifications(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => n.is_read === 0).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private showNotificationToaster(notification: Notification): void {
    const title = this.getNotificationTitle(notification);

    this.toastr.info(notification.message, title );
  }

  private getNotificationTitle(notification: Notification): string {
    switch (notification.type) {
      case 'order':
        return 'New Order!';
      case 'message':
        return 'New Message!';
      case 'appointment':
        return 'New Appointment!';
      default:
        return 'Notification';
    }
  }
}

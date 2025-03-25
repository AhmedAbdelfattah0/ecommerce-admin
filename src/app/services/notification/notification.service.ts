import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef, createComponent } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationToastComponent } from '../../components/dialogs/notification-toast/notification-toast.component';

interface NotificationResponse {
  status: boolean;
  message: string;
  data: {
    notifications: Notification[];
  };
}

export interface Notification {
  id: number;
  type: 'order' | 'message';
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
  private currentToasts: Map<number, ComponentRef<NotificationToastComponent>> = new Map();
  private soundEnabled = false;

  // Match these values with NotificationToastComponent
  private readonly baseTop = 20;
  private readonly height = 160;
  private readonly spacing = 16;

  notifications$ = this.notificationsSubject.asObservable();
  private notificationSound: HTMLAudioElement | null = null;

  constructor(
    private http: HttpClient,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    // Initialize sound only when needed
    this.initializeSound();
  }

  private initializeSound() {
    // Create audio element only when first needed
    if (!this.notificationSound) {
      this.notificationSound = new Audio('734443__universfield__system-notification-4.mp3');
      this.notificationSound.load(); // Preload the sound file
    }
  }

  enableSound() {
    this.soundEnabled = true;
    // Try to play a silent sound to handle the first interaction
    this.initializeSound();
    if (this.notificationSound) {
      this.notificationSound.volume = 0;
      this.notificationSound.play().then(() => {
        this.notificationSound!.volume = 1;
      }).catch(() => {
        console.log('Sound will be enabled on next notification');
      });
    }
  }

  disableSound() {
    this.soundEnabled = false;
  }

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
    return this.http.get<NotificationResponse>('/notifications/get_notifications.php').pipe(
      tap({
        next: (response) => {
          if (response.status && response.data.notifications) {
            const currentNotifications = this.notificationsSubject.getValue();
            const newNotifications = response.data.notifications.filter(
              notification => !currentNotifications.some(
                current => current.id === notification.id
              )
            );

            if (newNotifications.length > 0 && this.soundEnabled) {
              this.playNotificationSound();
            }

            // Update notifications in subject
            this.notificationsSubject.next(response.data.notifications);

            // Show popup for each new notification
            newNotifications.forEach(notification => {
              this.showNotificationToast(notification);
            });
          }
        },
        error: (error) => {
          console.error('Error checking notifications:', error);
        }
      })
    );
  }

  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.post('/notifications/mark_notifications.php', { id: notificationId }).pipe(
      tap({
        next: () => {
          // Update local state
          const currentNotifications = this.notificationsSubject.getValue();
          const updatedNotifications = currentNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: 1 }
              : notification
          );
          this.notificationsSubject.next(updatedNotifications);

          // Close toast if it exists
          if (this.currentToasts.has(notificationId)) {
            this.removeToast(notificationId);
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      })
    );
  }

  private playNotificationSound() {
    if (this.soundEnabled && this.notificationSound) {
      this.notificationSound.play().catch(error => {
        console.log('Notification sound blocked by browser policy');
        this.soundEnabled = false; // Disable sound if it fails
      });
    }
  }

  private showNotificationToast(notification: Notification): void {
    // Remove existing toast for this notification if it exists
    if (this.currentToasts.has(notification.id)) {
      this.removeToast(notification.id);
    }

    // Create component
    const componentRef = createComponent(NotificationToastComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Set inputs
    componentRef.instance.notification = notification;
    componentRef.instance.position = this.currentToasts.size;

    // Handle events
    componentRef.instance.close.subscribe(() => {
      this.removeToast(notification.id);
    });

    componentRef.instance.action.subscribe(() => {
      this.markNotificationAsRead(notification.id).subscribe();
    });

    // Attach to the DOM
    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild((componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0]);

    // Store reference
    this.currentToasts.set(notification.id, componentRef);

    // Auto close after 10 seconds
    setTimeout(() => {
      if (this.currentToasts.has(notification.id)) {
        this.removeToast(notification.id);
      }
    }, 10000);
  }

  private removeToast(id: number) {
    const componentRef = this.currentToasts.get(id);
    if (componentRef) {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.currentToasts.delete(id);
      this.reposition();
    }
  }

  private reposition(): void {
    let index = 0;
    this.currentToasts.forEach(componentRef => {
      // Update position property
      componentRef.instance.position = index;

      // Update DOM position directly
      const element = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      const offset = index * (this.height + this.spacing);
      element.style.top = `${this.baseTop + offset}px`;
      element.style.transition = 'top 0.3s ease-in-out';

      index++;
    });
  }
}

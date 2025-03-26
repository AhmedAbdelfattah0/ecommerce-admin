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
  private soundInitialized = false;
  private readonly SOUND_PREFERENCE_KEY = 'notification_sound_enabled';

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
    // Load sound preference from localStorage
    this.loadSoundPreference();

    // Initialize sound only when needed
    if (this.soundEnabled) {
      this.initializeSound();
    }
  }

  private loadSoundPreference() {
    const savedPreference = localStorage.getItem(this.SOUND_PREFERENCE_KEY);
    this.soundEnabled = savedPreference === 'true';
  }

  private saveSoundPreference() {
    localStorage.setItem(this.SOUND_PREFERENCE_KEY, String(this.soundEnabled));
  }

  private initializeSound() {
    try {
      // Create audio element if it doesn't exist
      if (!this.notificationSound) {
        this.notificationSound = new Audio('/assets/sounds/notification.mp3');

        // Add event listeners for better debugging
        this.notificationSound.addEventListener('error', (e) => {
          console.error('Audio error:', e);
        });

        this.notificationSound.addEventListener('canplaythrough', () => {
          this.soundInitialized = true;
          console.log('Notification sound loaded and ready');
        });

        // Preload the sound file
        this.notificationSound.load();
      }
    } catch (error) {
      console.error('Error initializing sound:', error);
    }
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  enableSound() {
    this.soundEnabled = true;
    this.saveSoundPreference();

    // Initialize sound if needed
    if (!this.notificationSound) {
      this.initializeSound();
    }

    // Try to play a silent sound to unlock audio
    this.unlockAudio();
  }

  disableSound() {
    this.soundEnabled = false;
    this.saveSoundPreference();
  }

  toggleSound(): boolean {
    if (this.soundEnabled) {
      this.disableSound();
    } else {
      this.enableSound();
    }
    return this.soundEnabled;
  }

  private unlockAudio() {
    // This function tries to unlock audio by playing a silent sound
    // after user interaction (which is typically when toggleSound is called)
    if (!this.notificationSound) {
      this.initializeSound();
    }

    if (this.notificationSound) {
      // Store original volume, set to silent
      const originalVolume = this.notificationSound.volume;
      this.notificationSound.volume = 0.01;

      // Try to play, then restore volume
      this.notificationSound.play()
        .then(() => {
          // Successfully played, restore volume and pause
          this.notificationSound!.volume = originalVolume;
          this.notificationSound!.pause();
          this.notificationSound!.currentTime = 0;
          this.soundInitialized = true;
          console.log('Audio unlocked successfully');
        })
        .catch((error) => {
          console.warn('Could not unlock audio:', error);
          // Restore volume even if failed
          this.notificationSound!.volume = originalVolume;
        });
    }
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

            if (newNotifications.length > 0 && this.soundEnabled && newNotifications.some(notification => notification.is_read === 0)) {
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
    if (!this.soundEnabled) return;

    // If sound not initialized, try to initialize it
    if (!this.soundInitialized) {
      this.initializeSound();
    }

    if (this.notificationSound) {
      // Reset to beginning if currently playing
      this.notificationSound.currentTime = 0;

      this.notificationSound.play()
        .then(() => {
          console.log('Notification sound played successfully');
        })
        .catch(error => {
          console.warn('Could not play notification sound:', error);
          // Don't automatically disable sound - user preference should persist
          // but mark sound as not initialized so we try again on next user interaction
          this.soundInitialized = false;
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

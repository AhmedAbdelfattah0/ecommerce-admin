import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { LayoutService } from '../../../services/layout/layout.service';
import { NotificationService, Notification } from '../../../services/notification/notification.service';
import { MobileNavSheetComponent } from '../mobile-nav/mobile-nav-sheet.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private readonly SOUND_PREFERENCE_KEY = 'notification_sound_enabled';
  imageLoaded = false;
  imageError = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  soundEnabled = false;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private router: Router,
    private notificationService: NotificationService,
    private bottomSheet: MatBottomSheet
  ) {
    this.loadSoundPreference();
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // Breakpoint for mobile devices
  }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.unreadCount = notifications.filter(n => n.is_read === 0).length;
    });
  }

  private loadSoundPreference(): void {
    const savedPreference = localStorage.getItem(this.SOUND_PREFERENCE_KEY);
    if (savedPreference !== null) {
      this.soundEnabled = savedPreference === 'true';
      // Apply the saved preference
      if (this.soundEnabled) {
        this.notificationService.enableSound();
      } else {
        this.notificationService.disableSound();
      }
    }
  }

  private saveSoundPreference(enabled: boolean): void {
    localStorage.setItem(this.SOUND_PREFERENCE_KEY, enabled.toString());
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.notificationService.enableSound();
    } else {
      this.notificationService.disableSound();
    }
    // Save the new preference
    this.saveSoundPreference(this.soundEnabled);
  }

  handleNotificationClick(notification: Notification): void {
    // Mark notification as read
    this.notificationService.markNotificationAsRead(notification.id).subscribe();

    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        this.router.navigate(['/orders']);
        break;
      case 'message':
        this.router.navigate(['/messages']);
        break;
    }
  }

  viewAllNotifications(): void {
    // Navigate to notifications page or show all notifications
    this.router.navigate(['/notifications']);
  }

  toggleSideNav(): void {
    if (this.isMobile) {
      this.openMobileNav();
    } else {
      this.layoutService.toggleSideNav();
    }
  }

  private openMobileNav(): void {
    this.bottomSheet.open(MobileNavSheetComponent, {
      panelClass: 'mobile-nav-sheet'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleImageError(event: Event) {
    this.imageError = true;
    this.imageLoaded = true;
    console.error('Error loading logo:', event);
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
  }
}

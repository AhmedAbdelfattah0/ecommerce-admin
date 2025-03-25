import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, Notification } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-new-orders-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="notification-dialog-container" [@fadeInOut]>
      <div class="notification-content">
        <div class="notification-header">
          <div class="icon-wrapper">
            <mat-icon class="notification-icon">{{ getNotificationIcon() }}</mat-icon>
          </div>
          <h2>{{ getNotificationTitle() }}</h2>
          <button mat-icon-button class="close-button" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <p>{{ data.message }}</p>
        <div class="notification-footer">
          <span class="notification-time">{{ formatTime(data.created_at) }}</span>
          <button mat-button color="primary" (click)="handleAction()">
            {{ getActionButtonText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .notification-dialog-container {
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: white;
      border-radius: 12px;
      width: 300px;
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.02),
        0 4px 8px rgba(0, 0, 0, 0.02),
        0 8px 16px rgba(0, 0, 0, 0.02),
        0 16px 32px rgba(0, 0, 0, 0.02);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .notification-content {
      display: flex;
      flex-direction: column;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--primary-color-light);

        .notification-icon {
          font-size: 18px;
          height: 18px;
          width: 18px;
          color: var(--primary-color);
          animation: pulse 2s infinite;
        }
      }

      h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
      }

      .close-button {
        margin: -8px -8px -8px 0;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
      padding: 0 4px;
    }

    .notification-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      .notification-time {
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      button {
        font-size: 0.875rem;
        padding: 0 12px;
        line-height: 32px;
        border-radius: 8px;
        font-weight: 500;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--primary-color-light);
        }
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class NewOrdersDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Notification,
    private dialogRef: MatDialogRef<NewOrdersDialogComponent>,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  getNotificationIcon(): string {
    switch (this.data.type) {
      case 'order':
        return 'shopping_cart';
      case 'message':
        return 'message';
      default:
        return 'notifications';
    }
  }

  getNotificationTitle(): string {
    switch (this.data.type) {
      case 'order':
        return 'New Order!';
      case 'message':
        return 'New Message!';
      default:
        return 'Notification';
    }
  }

  getActionButtonText(): string {
    switch (this.data.type) {
      case 'order':
        return 'View Order';
      case 'message':
        return 'Read Message';
      default:
        return 'View';
    }
  }

  handleAction(): void {
    // Mark notification as read
    this.notificationService.markNotificationAsRead(this.data.id).subscribe(() => {
      // Navigate based on notification type
      switch (this.data.type) {
        case 'order':
          this.router.navigate(['/orders']);
          break;
        case 'message':
          this.router.navigate(['/messages']);
          break;
      }
      this.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }
}

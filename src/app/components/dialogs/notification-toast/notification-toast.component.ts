import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { Notification } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NotificationToastComponent implements OnChanges {
  @Input() notification!: Notification;
  @Input() position: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  private readonly baseTop = 70;
  private readonly height = 160;
  private readonly spacing = 16;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.updatePosition();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position']) {
      this.updatePosition();
    }
  }

  private updatePosition() {
    const offset = this.position * (this.height + this.spacing);

    requestAnimationFrame(() => {
      const element = this.elementRef.nativeElement as HTMLElement;
      element.style.top = `${this.baseTop + offset}px`;
      element.style.transition = 'top 0.3s ease-in-out';
    });
  }

  getNotificationIcon(): string {
    switch (this.notification.type) {
      case 'order':
        return 'shopping_cart';
      case 'message':
        return 'message';
      default:
        return 'notifications';
    }
  }

  getNotificationTitle(): string {
    switch (this.notification.type) {
      case 'order':
        return 'New Order!';
      case 'message':
        return 'New Message!';
      default:
        return 'Notification';
    }
  }

  getActionButtonText(): string {
    switch (this.notification.type) {
      case 'order':
        return 'View Order';
      case 'message':
        return 'Read Message';
      default:
        return 'View';
    }
  }

  onClose() {
    this.close.emit();
  }

  onAction() {
    this.action.emit();
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

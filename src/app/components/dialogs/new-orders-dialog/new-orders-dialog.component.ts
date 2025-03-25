import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface DialogData {
  count: number;
}

@Component({
  selector: 'app-new-orders-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="notification-container" [@fadeInOut]>
      <mat-icon class="notification-icon">notifications_active</mat-icon>
      <div class="notification-content">
        <h2>New Orders!</h2>
        <p>You have {{ data.count }} new order{{ data.count > 1 ? 's' : '' }}!</p>
      </div>
      <div class="notification-actions">
        <button mat-button color="primary" (click)="viewOrders()">
          View Orders
        </button>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      gap: 16px;
    }

    .notification-icon {
      color: #f59e0b;
      font-size: 24px;
      height: 24px;
      width: 24px;
      animation: pulse 2s infinite;
    }

    .notification-content {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
      }

      p {
        margin: 4px 0 0;
        color: #64748b;
      }
    }

    .notification-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class NewOrdersDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<NewOrdersDialogComponent>,
    private router: Router
  ) {}

  viewOrders(): void {
    this.router.navigate(['/orders']);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}

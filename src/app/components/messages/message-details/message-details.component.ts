import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Message } from '../../../models/message';
import { MessagesService } from '../../../services/messages/messages.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-message-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent
  ],
  template: `
    <app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>

    <div class="container" *ngIf="message">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Message Details</mat-card-title>
          <div class="header-actions">
            <a routerLink="/messages" mat-button>
              <mat-icon>arrow_back</mat-icon>
              Back to Messages
            </a>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="message-details">
            <div class="detail-row">
              <span class="label">From:</span>
              <span class="value">{{message.name}} ({{message.email}})</span>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">{{message.subject}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{message.created_at | date:'medium'}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">
                <span [class]="'status-badge ' + message.status">
                  {{message.status}}
                </span>
              </span>
            </div>
            <div class="message-content">
              <span class="label">Message:</span>
              <p class="value message-text">{{message.message}}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <mat-spinner diameter="50"></mat-spinner>
    </div>

    <div class="error-message" *ngIf="error">
      <p>{{error}}</p>
      <button mat-raised-button color="primary" (click)="loadMessage()">Try Again</button>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header-actions {
      margin-left: auto;
    }

    .message-details {
      padding: 20px;
    }

    .detail-row {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
    }

    .label {
      font-weight: 500;
      min-width: 100px;
      color: rgba(0, 0, 0, 0.6);
    }

    .value {
      flex: 1;
    }

    .message-content {
      margin-top: 24px;
    }

    .message-text {
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-top: 8px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: capitalize;
      font-weight: 500;
      font-size: 12px;
    }

    .status-badge.read {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.unread {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .error-message {
      text-align: center;
      padding: 20px;
      color: red;
    }
  `]
})
export class MessageDetailsComponent implements OnInit {
  message: Message | null = null;
  isLoading = false;
  error: string | null = null;
  messageId!: number;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Messages', url: '/messages' },
    { label: 'Message Details' }
  ];

  constructor(
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this.messageId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMessage();
  }

  loadMessage(): void {
    if (!this.messageId) return;

    this.isLoading = true;
    this.error = null;

    this.messagesService.getMessage(this.messageId)
      .subscribe({
        next: (response) => {
          this.message = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }
}

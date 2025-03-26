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
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss']
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

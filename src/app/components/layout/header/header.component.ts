import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { LayoutService } from '../../../services/layout/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="toggleSideNav()">
        <mat-icon>menu</mat-icon>
      </button>
      <div class="logo-container">
        <img
          src="https://lugarstore.com/uploads/modified_logo.svg"
          alt="Lugare Store"
          class="logo"
          (error)="handleImageError($event)"
          [ngStyle]="{'display': imageLoaded ? 'block' : 'none'}"
          (load)="onImageLoad()"
        >
        <div *ngIf="!imageLoaded && !imageError" class="logo-placeholder">Loading...</div>
        <div *ngIf="imageError" class="logo-error">Unable to load logo</div>
      </div>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .logo-container {
      display: flex;
      align-items: center;
      margin-left: 16px;
    }

    .logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .logo-placeholder,
    .logo-error {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-left: 16px;
    }

    .logo-error {
      color: #ffcdd2;
    }
  `]
})
export class HeaderComponent {
  imageLoaded = false;
  imageError = false;

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private router: Router
  ) {}

  toggleSideNav(): void {
    this.layoutService.toggleSideNav();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleImageError(event: Event) {
    this.imageError = true;
    console.error('Error loading logo:', event);
  }

  onImageLoad() {
    this.imageLoaded = true;
  }
}

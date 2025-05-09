import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ToasterComponent } from './shared/toaster/toaster.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { SideNavComponent } from './components/layout/side-nav/side-nav.component';
import { AuthService } from './services/auth/auth.service';
import { LayoutService } from './services/layout/layout.service';
import { NotificationService } from './services/notification/notification.service';
import { ResponsiveService } from './common/services/responsive.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    ToasterComponent,
    HeaderComponent,
    SideNavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lugare-store-admin';
  isAuthenticated = false;
  isSideNavOpen = true;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private layoutService: LayoutService,
    private notificationService: NotificationService,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit() {
    // Check initial auth state
    this.updateAuthState();

    // Listen for route changes to update auth state
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateAuthState();
      }
    });

    // Subscribe to sidenav state changes
    this.layoutService.sideNavOpen$.subscribe(
      isOpen => this.isSideNavOpen = isOpen
    );

    // Subscribe to responsive changes
    this.responsiveService.isMobile$.subscribe(
      isMobile => this.isMobile = isMobile
    );

    // Start checking for new orders
    if (this.authService.isAuthenticated()) {
      this.notificationService.startNotificationsCheck();
    }
  }

  private updateAuthState() {
    const isLoginPage = this.router.url === '/login';
    this.isAuthenticated = this.authService.isAuthenticated() && !isLoginPage;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <mat-nav-list class="side-nav">
    	<a mat-list-item routerLink="/dashboard" routerLinkActive="active">
    		<mat-icon matListItemIcon>dashboard</mat-icon>
    		<span matListItemTitle>Dashboard</span>
    	</a>
    	<a mat-list-item routerLink="/products" routerLinkActive="active">
    		<mat-icon matListItemIcon>inventory_2</mat-icon>
    		<span matListItemTitle>Products</span>
    	</a>
    	<a mat-list-item routerLink="/categories" routerLinkActive="active">
    		<mat-icon matListItemIcon>category</mat-icon>
    		<span matListItemTitle>Categories</span>
    	</a>
    	<a mat-list-item routerLink="/marketing-categories" routerLinkActive="active">
    		<mat-icon matListItemIcon>campaign</mat-icon>
    		<span matListItemTitle>Marketing Categories</span>
    	</a>
    	<a mat-list-item routerLink="/orders" routerLinkActive="active">
    		<mat-icon matListItemIcon>shopping_cart</mat-icon>
    		<span matListItemTitle>Orders</span>
    	</a>
    	<a mat-list-item routerLink="/messages" routerLinkActive="active">
    		<mat-icon matListItemIcon>message</mat-icon>
    		<span matListItemTitle>Messages</span>
    	</a>
    	<a mat-list-item routerLink="/banners" routerLinkActive="active">
    		<mat-icon matListItemIcon>image</mat-icon>
    		<span matListItemTitle>Banners</span>
    	</a>
    </mat-nav-list>`,
  styles: [`
    .side-nav {
        width: max-content;
        height: 100%;
        background-color: white;
        border-right: 1px solid rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        a {
            border-radius: 0px !important;
        }
    }
    .active {
        background-color: rgba(0, 0, 0, 0.04);
    }
    mat-icon {
        margin-right: 8px;
    }
    ::ng-deep .mat-mdc-nav-list .mat-mdc-list-item {
        border-radius: 0px !important;
    }`]
})
export class SideNavComponent { }

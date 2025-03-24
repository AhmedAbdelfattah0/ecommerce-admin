import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Banner } from '../../../models/banner';
import { BannersService } from '../../../services/banners/banners.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDialogModule,
    BreadcrumbComponent
  ],
  templateUrl: './banner-list.component.html',
  styleUrls: ['./banner-list.component.scss']
})
export class BannerListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'image', 'visible', 'selected', 'created_at', 'actions'];
  dataSource: Banner[] = [];
  isLoading = false;
  error: string | null = null;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Banners' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Banner>;

  constructor(
    private bannersService: BannersService,
    private dialog: MatDialog,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.isLoading = true;
    this.error = null;

    this.bannersService.getBanners()
      .subscribe({
        next: (response) => {
          this.dataSource = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }

  toggleVisibility(banner: Banner): void {
    const updateData = {
      id: banner.id,
      visible: !banner.visible,
      selected: banner.selected
    };

    this.isLoading = true;
    this.bannersService.updateBannerVisibility(updateData)
      .subscribe({
        next: (response) => {
          banner.visible = response.data.visible;
          this.toasterService.openToaster(toasterCases.PRODUCT_UPDATED);
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }

  toggleSelection(banner: Banner): void {
    const updateData = {
      id: banner.id,
      visible: banner.visible,
      selected: !banner.selected
    };

    this.isLoading = true;
    this.bannersService.updateBannerVisibility(updateData)
      .subscribe({
        next: (response) => {
          banner.selected = response.data.selected;
          this.toasterService.openToaster(toasterCases.PRODUCT_UPDATED);
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }

  deleteBanner(banner: Banner): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Banner',
        message: 'Are you sure you want to delete this banner?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.bannersService.deleteBanner(banner.id)
          .subscribe({
            next: () => {
              this.toasterService.openToaster(toasterCases.PRODUCT_DELETED);
              this.loadBanners();
            },
            error: (error) => {
              this.error = error.message;
              this.isLoading = false;
            }
          });
      }
    });
  }
}

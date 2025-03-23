import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CatigoryService } from '../../../services/categories/categories.service';
import { Category } from '../../../models/category';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';
import { finalize } from 'rxjs/operators';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    RouterModule,
    BreadcrumbComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'image', 'title', 'actions'];
  dataSource: Category[] = [];
  filteredData: Category[] = [];
  isLoading = false;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Category>;

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Categories' }
  ];

  constructor(
    private categoryService: CatigoryService,
    private dialog: MatDialog,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCatigories()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.dataSource = data;
          this.filteredData = data;
          // Need to re-render the table if it's already initialized
          if (this.table) {
            this.table.renderRows();
          }
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.toasterService.openToaster({
            message: 'Failed to load categories. Please try again.',
            type: 'error'
          });
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();

    if (this.searchTerm === '') {
      this.filteredData = this.dataSource;
    } else {
      this.filteredData = this.dataSource.filter(category =>
        category.title.toLowerCase().includes(this.searchTerm) ||
        category.titleAr.toLowerCase().includes(this.searchTerm) ||
        category.id.toString().includes(this.searchTerm)
      );
    }
  }

  deleteCategory(id: number): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.categoryService.deleteCategory(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.dataSource = this.dataSource.filter(category => category.id !== id);
              this.filteredData = this.filteredData.filter(category => category.id !== id);
              this.toasterService.openToaster(toasterCases.UnDEFAULT);
            },
            error: (error) => {
              console.error('Error deleting category:', error);
              this.toasterService.openToaster({
                message: 'Failed to delete category. Please try again.',
                type: 'error'
              });
            }
          });
      }
    });
  }
}

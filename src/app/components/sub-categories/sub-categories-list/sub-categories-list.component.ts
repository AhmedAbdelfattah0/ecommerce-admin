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
import { SubCategoriesService } from '../../../services/sub-categories/sub-categories.service';
import { SubCategory } from '../../../models/sub-category';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';
import { finalize } from 'rxjs/operators';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sub-categories-list',
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
  templateUrl: './sub-categories-list.component.html',
  styleUrls: ['./sub-categories-list.component.scss']
})
export class SubCategoriesListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'actions'];
  dataSource: SubCategory[] = [];
  filteredData: SubCategory[] = [];
  isLoading = false;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<SubCategory>;

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Sub-Categories' }
  ];

  constructor(
    private subCategoriesService: SubCategoriesService,
    private dialog: MatDialog,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadSubCategories();
  }

  loadSubCategories(): void {
    this.isLoading = true;

    this.subCategoriesService.getSubCategories()
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
          console.error('Error loading sub-categories:', error);
          this.toasterService.openToaster({
            message: 'Failed to load sub-categories. Please try again.',
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
      this.filteredData = this.dataSource.filter(subCategory =>
        subCategory.title.toLowerCase().includes(this.searchTerm) ||
        subCategory.titleAr.toLowerCase().includes(this.searchTerm) ||
        subCategory.id.toString().includes(this.searchTerm)
      );
    }
  }

  deleteSubCategory(id: number): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Delete Sub-Category',
      message: 'Are you sure you want to delete this sub-category? This action cannot be undone.',
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
        this.subCategoriesService.deleteSubCategory(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.dataSource = this.dataSource.filter(subCategory => subCategory.id !== id);
              this.filteredData = this.filteredData.filter(subCategory => subCategory.id !== id);
              this.toasterService.openToaster(toasterCases.UnDEFAULT);
            },
            error: (error) => {
              console.error('Error deleting sub-category:', error);
              this.toasterService.openToaster({
                message: 'Failed to delete sub-category. Please try again.',
                type: 'error'
              });
            }
          });
      }
    });
  }
}

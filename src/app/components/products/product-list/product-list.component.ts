import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product/product.service';
import { finalize } from 'rxjs/operators';
import { Product, ProductList } from '../../../models/product';
import { AddSpaceAfterCurrencyPipe } from "../../../common/pipes/add-space-after-currency";
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { toasterCases } from '../../../common/constants/app.constants';
import { ToasterService } from '../../../services/toatser.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

// Local product interface that matches our component needs

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule,
    AddSpaceAfterCurrencyPipe,
    BreadcrumbComponent,

  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: ProductList[] = [];
  dataSource!: MatTableDataSource<ProductList>;
  displayedColumns: string[] = ['id', 'imgOne', 'title', 'price', 'categoryName',  'actions'];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Products' }
  ];

  constructor(
    private productService: ProductService,
    private toasterService: ToasterService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (apiProducts) => {
          // Map API response to match our ProductDisplay interface
          this.products = apiProducts.map(p => {
            // Handle differences in API response structure
            const product: ProductList = {
              id: p.id || 0,
              title: p.title || 'Unknown Product',
              price: Number(p.discountedPrice) ? p.discountedPrice : p.originalPrice  ,
              categoryName: p.categoryName || 'Uncategorized',
              // stock: p.quantity || p.stock || 0,
              imgOne: p.imgOne || p.imgTwo || p.imgThree || p.imgFour || '',

              titleAr: p.titleAr || '',
              discountedPrice: p.discountedPrice || 0,
              description: p.description || '',
              originalPrice: p.originalPrice || 0,
              qty: p.quantity || 0,

            };
            return product;
          });
          this.initializeDataSource();
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          // Fallback to empty array in case of error
          this.products = [];
          this.initializeDataSource();
        }
      });
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.products);
    // Set up sorting and pagination after view init
    setTimeout(() => {
      if (this.sort && this.paginator) {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteProduct(id: number): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
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
        this.productService.deleteProduct(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.products = this.products.filter(product => product.id !== id);
              this.dataSource.data = this.products;
              this.toasterService.openToaster(toasterCases.PRODUCT_DELETED);
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              this.toasterService.openToaster({
                message: 'Failed to delete product. Please try again.',
                type: 'error'
              });
            }
          });
      }
    });
  }

  getStockClass(stock: number): string {
    if (stock <= 0) {
      return 'out-of-stock';
    } else if (stock < 10) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  }
}

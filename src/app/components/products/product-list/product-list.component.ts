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
    CommonModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: ProductList[] = [];
  dataSource!: MatTableDataSource<ProductList>;
  displayedColumns: string[] = ['id', 'imgOne', 'title', 'price', 'category', 'stock', 'actions'];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productService: ProductService) {}

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
              price: p.discountedPrice ? p.discountedPrice : p.originalPrice || 0,
              // category: p.categoryName || 'Uncategorized',
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
    // Would call API service here
    // For now, just remove from local array
    this.products = this.products.filter(product => product.id !== id);
    this.dataSource.data = this.products;
    // Show a success message
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

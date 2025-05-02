import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product/product.service';
import { SuCategoriesService } from '../../../services/sub-categories/su-categories.service';
import { CatigoryService } from '../../../services/categories/categories.service';
import { Category } from '../../../models/category';
import { SubCategory } from '../../../models/sub-category';
import { finalize } from 'rxjs/operators';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { toasterCases } from '../../../common/constants/app.constants';
import { ToasterService } from '../../../services/toatser.service';
// Define an extended interface for UI display

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  isLoading = false;
  productsList: any[] = [];
  currentProductIndex: number = -1;

  // Image previews
  imagePreview: { [key: string]: string } = {
    imgOne: '',
    imgTwo: '',
    imgThree: '',
    imgFour: ''
  };

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Products', url: '/products' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CatigoryService,
    private subCategoriesService: SuCategoriesService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadSubCategories();
    this.loadAllProducts();

    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProductDetails(this.productId);
      this.breadcrumbItems.push({ label: 'Edit Product' });
    } else {
      this.breadcrumbItems.push({ label: 'Add Product' });
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required]],
      titleAr: [''],
      description: ['', [Validators.required]],
      discountedPrice: [{value: '', disabled: true}],
      originalPrice: ['', [Validators.required]],
      imgOne: ['', [Validators.required]],
      imgTwo: [''],
      imgThree: [''],
      imgFour: [''],
      videoLink: [''],
      categoryId: ['', [Validators.required]],
      subCategoryId: [null],
      rating: [0],
      isNew: [false],
      discount: [0],
      reviews: [0],
      badge: [''],
      subtitle: [''],
      availability: ['in-stock'],
      qty: [0]
    });

    // Subscribe to form value changes to update image previews
    this.productForm.get('imgOne')?.valueChanges.subscribe(val => {
      this.imagePreview['imgOne'] = val;
    });

    this.productForm.get('imgTwo')?.valueChanges.subscribe(val => {
      this.imagePreview['imgTwo'] = val;
    });

    this.productForm.get('imgThree')?.valueChanges.subscribe(val => {
      this.imagePreview['imgThree'] = val;
    });

    this.productForm.get('imgFour')?.valueChanges.subscribe(val => {
      this.imagePreview['imgFour'] = val;
    });

    // Calculate discounted price when original price or discount changes
    this.productForm.get('originalPrice')?.valueChanges.subscribe(() => {
      this.updateDiscountedPrice();
    });

    this.productForm.get('discount')?.valueChanges.subscribe(() => {
      this.updateDiscountedPrice();
    });
  }

  // Calculate and update discounted price based on original price and discount
  updateDiscountedPrice(): void {
    const originalPrice = parseFloat(this.productForm.get('originalPrice')?.value) || 0;
    const discount = parseFloat(this.productForm.get('discount')?.value) || 0;

    if (originalPrice > 0 && discount > 0) {
      const discountAmount = originalPrice * (discount / 100);
      const discountedPrice = originalPrice - discountAmount;
      // Format to 2 decimal places
      this.productForm.get('discountedPrice')?.setValue(discountedPrice.toFixed(2));
    } else {
      // If no discount or no original price, set discounted price to 0
      this.productForm.get('discountedPrice')?.setValue('0.00');
    }
  }

  // Method to handle image file selection
  onImageSelected(event: Event, imageField: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a server and get a URL back
    // For now, create a local object URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      // Update form with mock URL (in production this would be the uploaded file URL)
      this.productForm.get(imageField)?.setValue(reader.result as string);

      // In a real app, you would make an API call to upload the file here
      // and then set the returned URL to the form control
      console.log(`Uploading ${imageField}...`);
    };
    reader.readAsDataURL(file);
  }

  // Method to clear image
  clearImage(imageField: string) {
    this.productForm.get(imageField)?.setValue('');
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCatigories()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
        }
      });
  }

  loadSubCategories(): void {
    this.isLoading = true;
    this.subCategoriesService.getSubCatigories()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          // Map API subcategories to our display format
          this.subCategories = data
        },
        error: (err) => {
          console.error('Error loading subcategories:', err);
        }
      });
  }

  loadProductDetails(id: number): void {
    this.isLoading = true;
    this.productService.getProduct(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (product: Product) => {
          // Map API response to our form format
          const formData: any = {
            title: product.title,
            titleAr: product.titleAr,
            description: product.description,
            discountedPrice: product.discountedPrice,
            originalPrice: product.originalPrice,
            imgOne: product.imgOne,
            imgTwo: product.imgTwo,
            imgThree: product.imgThree,
            imgFour: product.imgFour,
            videoLink: product.videoLink,
            categoryId: product.categoryId,
            subCategoryId: product.subCategoryId || null,
            rating: product.rating || 0,
            isNew: product.isNew || false,
            discount: product.discount || 0,
            reviews: product.reviews || 0,
            badge: product.badge,
            subtitle: product.subtitle,
            availability: product.availability || 'in-stock',
            qty: product.qty || 0
          };

          // Set the form values
          this.productForm.patchValue(formData);

          // Update discounted price based on loaded values
          this.updateDiscountedPrice();

          // Update image previews
          this.imagePreview['imgOne'] = product.imgOne;
          this.imagePreview['imgTwo'] = product.imgTwo || '';
          this.imagePreview['imgThree'] = product.imgThree || '';
          this.imagePreview['imgFour'] = product.imgFour || '';
        },
        error: (err) => {
          console.error('Error loading product details:', err);
          // Handle error, could redirect or show message
        }
      });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const productData = this.productForm.value;
    this.isLoading = true;

    if (this.isEditMode && this.productId) {
      // Include the ID for the update
      const updatedProduct = {
        ...productData,
        id: this.productId
      };
      this.updateProduct(updatedProduct)

    } else {
      this.createProduct(productData)
    }
  }



  updateProduct(product:Product){
    this.productService.updateProduct(product)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response) => {
        console.log('Product updated successfully', response);
        this.toasterService.openToaster(toasterCases.PRODUCT_UPDATED);
        // this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        // Show error message to user here
        // For example, use a snackbar or alert
      }
    });
  }

  createProduct(product:Product){
    this.productService.createProduct(product)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            console.log('Product created successfully', response);
            this.router.navigate(['/products']);
            this.toasterService.openToaster(toasterCases.PRODUCT_CREATED);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            // Show error message to user here
          }
        });
  }

  loadAllProducts(): void {
    this.productService.getProducts()
      .subscribe({
        next: (products) => {
          debugger;
          this.productsList = products;
          if (this.productId) {
            this.findCurrentProductIndex();
          }
        },
        error: (err) => {
          console.error('Error loading products list:', err);
        }
      });
  }

  findCurrentProductIndex(): void {
    if (!this.productId || this.productsList.length === 0) return;

    this.currentProductIndex = this.productsList.findIndex(p => p.id == this.productId);
  }

  goToNextProduct(): void {
    if (this.currentProductIndex === -1 || this.productsList.length === 0) return;

    const nextIndex = (this.currentProductIndex + 1) % this.productsList.length;
    const nextProductId = this.productsList[nextIndex].id;

    // Update product ID and reload the component data
    this.productId = nextProductId;
    this.loadProductDetails(nextProductId);
    this.findCurrentProductIndex();

    // Update URL without triggering a full navigation
    this.router.navigate(['/products/edit', nextProductId], {
      replaceUrl: true
    });
  }

}

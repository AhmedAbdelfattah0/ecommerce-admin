import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/category';
import { CatigoryService } from '../../../services/categories/categories.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId: number | null = null;
  isLoading = false;
  imagePreview: string = '';

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Categories', url: '/dashboard/categories' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CatigoryService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryId = +id;
      this.loadCategoryDetails(this.categoryId);
      this.breadcrumbItems.push({ label: 'Edit Category' });
    } else {
      this.breadcrumbItems.push({ label: 'Add Category' });
    }
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      title: ['', [Validators.required]],
      titleAr: ['', [Validators.required]],
      imgOne: ['', [Validators.required]]
    });

    // Subscribe to form value changes to update image preview
    this.categoryForm.get('imgOne')?.valueChanges.subscribe(val => {
      this.imagePreview = val;
    });
  }

  // Method to handle image file selection
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a server and get a URL back
    // For now, create a local object URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      // Update form with mock URL (in production this would be the uploaded file URL)
      this.categoryForm.get('imgOne')?.setValue(reader.result as string);

      // In a real app, you would make an API call to upload the file here
      // and then set the returned URL to the form control
      console.log('Uploading category image...');
    };
    reader.readAsDataURL(file);
  }

  // Method to clear image
  clearImage(): void {
    this.categoryForm.get('imgOne')?.setValue('');
  }

  loadCategoryDetails(id: number): void {
    this.isLoading = true;
    this.categoryService.getCategory(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (category) => {
          // Set the form values
          this.categoryForm.patchValue({
            title: category.title,
            titleAr: category.titleAr,
            imgOne: category.imgOne
          });

          // Update image preview
          this.imagePreview = category.imgOne;
        },
        error: (error) => {
          console.error('Error loading category details:', error);
          this.toasterService.openToaster({
            message: 'Failed to load category details. Please try again.',
            type: 'error'
          });
        }
      });
  }

  onSubmit(): void {
    // Mark all form controls as touched to trigger validation messages
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      this.toasterService.openToaster({
        message: 'Please fill all required fields correctly',
        type: 'error'
      });
      return;
    }

    const categoryData = this.categoryForm.value;
    this.isLoading = true;

    if (this.isEditMode && this.categoryId) {
      // Include the ID for the update
      const updatedCategory: Category = {
        ...categoryData,
        id: this.categoryId
      };

      this.categoryService.updateCategory(updatedCategory)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.toasterService.openToaster(toasterCases.PRODUCT_UPDATED);
            this.router.navigate(['/categories']);
          },
          error: (error) => {
            console.error('Error updating category:', error);
            const errorMessage = error.error?.message || 'Failed to update category. Please try again.';
            this.toasterService.openToaster({
              message: errorMessage,
              type: 'error'
            });
          }
        });
    } else {
      this.categoryService.createCategory(categoryData as Category)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.toasterService.openToaster(toasterCases.PRODUCT_CREATED);
            this.router.navigate(['/categories']);
          },
          error: (error) => {
            console.error('Error creating category:', error);
            const errorMessage = error.error?.message || 'Failed to create category. Please try again.';
            this.toasterService.openToaster({
              message: errorMessage,
              type: 'error'
            });
          }
        });
    }
  }

  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

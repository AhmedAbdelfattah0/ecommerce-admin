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
import { SubCategory } from '../../../models/sub-category';
import { SubCategoriesService } from '../../../services/sub-categories/sub-categories.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sub-category-form',
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
  templateUrl: './sub-category-form.component.html',
  styleUrls: ['./sub-category-form.component.scss']
})
export class SubCategoryFormComponent implements OnInit {
  subCategoryForm!: FormGroup;
  isEditMode = false;
  subCategoryId: number | null = null;
  isLoading = false;

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Sub-Categories', url: '/sub-categories' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private subCategoriesService: SubCategoriesService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.subCategoryId = +id;
      this.loadSubCategoryDetails(this.subCategoryId);
      this.breadcrumbItems.push({ label: 'Edit Sub-Category' });
    } else {
      this.breadcrumbItems.push({ label: 'Add Sub-Category' });
    }
  }

  initForm(): void {
    this.subCategoryForm = this.fb.group({
      title: ['', [Validators.required]],
      titleAr: ['', [Validators.required]]
    });
  }

  loadSubCategoryDetails(id: number): void {
    this.isLoading = true;
    this.subCategoriesService.getSubCategory(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (subCategory) => {
          // Set the form values
          this.subCategoryForm.patchValue({
            title: subCategory.title,
            titleAr: subCategory.titleAr
          });
        },
        error: (error) => {
          console.error('Error loading sub-category details:', error);
          this.toasterService.openToaster({
            message: 'Failed to load sub-category details. Please try again.',
            type: 'error'
          });
        }
      });
  }

  onSubmit(): void {
    // Mark all form controls as touched to trigger validation messages
    if (this.subCategoryForm.invalid) {
      this.markFormGroupTouched(this.subCategoryForm);
      this.toasterService.openToaster({
        message: 'Please fill all required fields correctly',
        type: 'error'
      });
      return;
    }

    const subCategoryData = this.subCategoryForm.value;
    this.isLoading = true;

    if (this.isEditMode && this.subCategoryId) {
      // Include the ID for the update
      const updatedSubCategory: SubCategory = {
        ...subCategoryData,
        id: this.subCategoryId
      };

      this.subCategoriesService.updateSubCategory(updatedSubCategory)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.toasterService.openToaster(toasterCases.PRODUCT_UPDATED);
            this.router.navigate(['/sub-categories']);
          },
          error: (error) => {
            console.error('Error updating sub-category:', error);
            const errorMessage = error.error?.message || 'Failed to update sub-category. Please try again.';
            this.toasterService.openToaster({
              message: errorMessage,
              type: 'error'
            });
          }
        });
    } else {
      this.subCategoriesService.createSubCategory(subCategoryData as SubCategory)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.toasterService.openToaster(toasterCases.PRODUCT_CREATED);
            this.router.navigate(['/sub-categories']);
          },
          error: (error) => {
            console.error('Error creating sub-category:', error);
            const errorMessage = error.error?.message || 'Failed to create sub-category. Please try again.';
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

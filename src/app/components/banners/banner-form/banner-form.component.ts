import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { BannersService } from '../../../services/banners/banners.service';
import { Banner } from '../../../models/banner';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { toasterCases } from '../../../common/constants/app.constants';
import { finalize } from 'rxjs/operators';

interface BannerFormData {
  id?: string;
  fileUrl: string;
  visible: boolean;
  selected: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent
  ],
  templateUrl: './banner-form.component.html',
  styleUrls: ['./banner-form.component.scss']
})
export class BannerFormComponent implements OnInit {
  form: FormGroup;
  banner: Banner | null = null;
  imagePreview: string | null = null;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  bannerId: number | null = null;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Banners', url: '/banners' },
    { label: 'Add Banner' }
  ];

  constructor(
    private fb: FormBuilder,
    private bannersService: BannersService,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {
    this.form = this.fb.group({
      visible: [true],
      selected: [false],
      file: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.bannerId = parseInt(id);
      this.breadcrumbItems[2].label = 'Edit Banner';
      this.loadBanner(this.bannerId);
    }
  }

  private loadBanner(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.bannersService.getBanner(id)
      .subscribe({
        next: (response) => {
          this.banner = response.data;
          this.form.patchValue({
            visible: this.banner.visible,
            selected: this.banner.selected
          });
          this.imagePreview = this.banner.fileUrl;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.error = null;

      const formData = {
        ...this.form.value,
        fileUrl: this.imagePreview || this.banner?.fileUrl || '',
        id: this.banner?.id
      };

      const request = this.isEditMode
        ? this.bannersService.updateBanner(formData)
        : this.bannersService.createBanner(formData);

      request.subscribe({
        next: () => {
          this.toasterService.openToaster(
            this.isEditMode ? toasterCases.PRODUCT_UPDATED : toasterCases.PRODUCT_CREATED
          );
          this.router.navigate(['/banners']);
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/banners']);
  }
}

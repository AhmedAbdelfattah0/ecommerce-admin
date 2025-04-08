import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';

import { CustomOrderService } from '../../../services/orders/custom-order.service';
import { CustomOrder, CustomOrderItem, MaterialItem, AddOnItem } from '../../../models/custom-order';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';
import { AddSpaceAfterCurrencyPipe } from '../../../common/pipes/add-space-after-currency';

@Component({
  selector: 'app-custom-order-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    BreadcrumbComponent,
    AddSpaceAfterCurrencyPipe
  ],
  templateUrl: './custom-order-details.component.html',
  styleUrls: ['./custom-order-details.component.scss']
})
export class CustomOrderDetailsComponent implements OnInit {
  orderId: string = '';
  order: CustomOrder | null = null;
  loading: boolean = false;
  error: string = '';
  pricingForm: FormGroup;
  submitting: boolean = false;
  selectedStatus: string = '';
  statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'priced', label: 'Priced' },
    { value: 'approved', label: 'Approved' },
    { value: 'in-progress', label: 'In Production' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Custom Orders', url: '/custom-orders' },
    { label: 'Order Details' }
  ];

  get itemsFormArray(): FormArray {
    return this.pricingForm.get('items') as FormArray;
  }

  get subtotal(): number {
    let total = 0;
    for (const itemControl of this.itemsFormArray.controls) {
      const itemPrice = parseFloat(itemControl.get('price')?.value) || 0;
      const quantity = parseFloat(itemControl.get('quantity')?.value) || 1;

      // Add materials prices
      const materialsArray = itemControl.get('materials') as FormArray;
      let materialsTotal = 0;
      for (const materialControl of materialsArray.controls) {
        const materialPrice = parseFloat(materialControl.get('price')?.value) || 0;
        const materialQuantity = parseFloat(materialControl.get('quantity')?.value) || 1;
        materialsTotal += materialPrice * materialQuantity;
      }

      // Add add-ons prices
      const addOnsArray = itemControl.get('addOns') as FormArray;
      let addOnsTotal = 0;
      for (const addOnControl of addOnsArray.controls) {
        const addOnPrice = parseFloat(addOnControl.get('price')?.value) || 0;
        const addOnQuantity = parseFloat(addOnControl.get('quantity')?.value) || 1;
        addOnsTotal += addOnPrice * addOnQuantity;
      }

      total += (itemPrice + materialsTotal + addOnsTotal) * quantity;
    }
    return total;
  }

  get tax(): number {
    return this.subtotal * 0.1; // 10% tax
  }

  get shipping(): number {
    return this.order?.deliveryMethod === 'premium' ? 100 : 50;
  }

  get total(): number {
    return this.subtotal + this.tax + this.shipping;
  }

  constructor(
    private route: ActivatedRoute,
    private customOrderService: CustomOrderService,
    private fb: FormBuilder,
    private toasterService: ToasterService
  ) {
    this.pricingForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.error = 'Order ID is missing';
    }
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';

    this.customOrderService.getCustomOrder(this.orderId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.selectedStatus = order.status;
          this.initPricingForm(order);
          this.breadcrumbs[2].label = `Order #${order.save_code}`;
        },
        error: (err) => {
          this.error = 'Failed to load order details: ' + err.message;
          this.toasterService.showError('Error', 'Failed to load order details');
        }
      });
  }

  initPricingForm(order: CustomOrder): void {
    // Clear the form array first
    while (this.itemsFormArray.length) {
      this.itemsFormArray.removeAt(0);
    }

    // Add each item to the form
    for (const item of order.items) {
      const itemGroup = this.fb.group({
        id: [item.id],
        itemName: [{ value: item.itemName, disabled: true }],
        price: [item.price === null ? '' : item.price, [Validators.required, Validators.min(0)]],
        quantity: [{ value: item.quantity, disabled: true }],
        materials: this.fb.array([]),
        addOns: this.fb.array([])
      });

      // Add materials
      const materialsArray = itemGroup.get('materials') as FormArray;
      if (item.materials && item.materials.length > 0) {
        for (const material of item.materials) {
          const materialGroup = this.fb.group({
            id: [material.materialId],
            name: [{ value: material.materialName, disabled: true }],
            price: [material.price === null ? '' : material.price, [Validators.required, Validators.min(0)]],
            quantity: [{ value: material.quantity, disabled: true }]
          });
          materialsArray.push(materialGroup);
        }
      }

      // Add add-ons
      const addOnsArray = itemGroup.get('addOns') as FormArray;
      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const addOnGroup = this.fb.group({
            id: [addOn.addOnId],
            name: [{ value: addOn.addOnName, disabled: true }],
            price: [addOn.price === null ? '' : addOn.price, [Validators.required, Validators.min(0)]],
            quantity: [{ value: addOn.quantity, disabled: true }]
          });
          addOnsArray.push(addOnGroup);
        }
      }

      this.itemsFormArray.push(itemGroup);
    }
  }

  savePricing(): void {
    if (this.pricingForm.invalid) {
      this.markFormGroupTouched(this.pricingForm);
      return;
    }

    this.submitting = true;

    const pricingData = {
      orderId: this.orderId,
      pricing: {
        itemPrices: this.itemsFormArray.controls.map((itemControl) => {
          const item = itemControl.value;
          const price = item.price === '' ? undefined : parseFloat(item.price);

          return {
            itemId: item.id,
            price: price,
            materialPrices: item.materials.map((material: any) => ({
              materialId: material.id,
              price: material.price === '' ? undefined : parseFloat(material.price)
            })),
            addOnPrices: item.addOns.map((addOn: any) => ({
              addOnId: addOn.id,
              price: addOn.price === '' ? undefined : parseFloat(addOn.price)
            }))
          };
        }),
        subtotal: this.subtotal,
        tax: this.tax,
        shipping: this.shipping,
        total: this.total
      }
    };

    this.customOrderService.updateCustomOrderPricing(this.orderId, pricingData.pricing)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (response) => {
          // Update the order object with new values instead of reloading
          if (this.order) {
            this.order.total_amount = response.total_amount;

            // Update status if it was 'draft'
            if (this.order.status === 'draft') {
              this.order.status = 'priced';
              this.selectedStatus = 'priced';
            }

            // Update the items in the order object
            this.itemsFormArray.controls.forEach((itemControl, index) => {
              if (this.order?.items[index]) {
                const itemPrice = itemControl.get('price')?.value;
                this.order.items[index].price = itemPrice === '' ? undefined : parseFloat(itemPrice || '0');

                // Update materials
                const materialsArray = itemControl.get('materials') as FormArray;
                materialsArray.controls.forEach((materialControl, mIndex) => {
                  if (this.order?.items[index].materials?.[mIndex]) {
                    const materialPrice = materialControl.get('price')?.value;
                    this.order.items[index].materials[mIndex].price = materialPrice === '' ? undefined : parseFloat(materialPrice || '0');
                  }
                });

                // Update add-ons
                const addOnsArray = itemControl.get('addOns') as FormArray;
                addOnsArray.controls.forEach((addOnControl, aIndex) => {
                  if (this.order?.items[index].addOns?.[aIndex]) {
                    const addOnPrice = addOnControl.get('price')?.value;
                    this.order.items[index].addOns[aIndex].price = addOnPrice === '' ? undefined : parseFloat(addOnPrice || '0');
                  }
                });
              }
            });
          }

          this.toasterService.showSuccess('Success', 'Order pricing has been updated');
        },
        error: (err) => {
          this.toasterService.showError('Error', 'Failed to update order pricing: ' + err.message);
        }
      });
  }

  generateContract(): void {
    try {
      // Open the contract in a new tab/window directly
      const pdfUrl = `https://lugarstore.com/api/orders/generate_contract.php?id=${this.orderId}`;
      const newWindow = window.open(pdfUrl, '_blank');

      // Check if the window was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('The PDF could not be opened. Please check your popup blocker settings.');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('There was an error generating the PDF. Please try again later.');
    }
  }

  getStatusChipClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'draft': return 'status-draft';
      case 'priced': return 'status-priced';
      case 'approved': return 'status-approved';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getItemTotal(itemIndex: number): number {
    const itemControl = this.itemsFormArray.at(itemIndex);
    const itemPrice = parseFloat(itemControl.get('price')?.value) || 0;
    const quantity = parseFloat(itemControl.get('quantity')?.value) || 1;

    // Add materials prices
    const materialsArray = itemControl.get('materials') as FormArray;
    let materialsTotal = 0;
    for (const materialControl of materialsArray.controls) {
      const materialPrice = parseFloat(materialControl.get('price')?.value) || 0;
      const materialQuantity = parseFloat(materialControl.get('quantity')?.value) || 1;
      materialsTotal += materialPrice * materialQuantity;
    }

    // Add add-ons prices
    const addOnsArray = itemControl.get('addOns') as FormArray;
    let addOnsTotal = 0;
    for (const addOnControl of addOnsArray.controls) {
      const addOnPrice = parseFloat(addOnControl.get('price')?.value) || 0;
      const addOnQuantity = parseFloat(addOnControl.get('quantity')?.value) || 1;
      addOnsTotal += addOnPrice * addOnQuantity;
    }

    return (itemPrice + materialsTotal + addOnsTotal) * quantity;
  }

  // Helper to mark all controls as touched for validation
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFormArray(control: any): FormArray {
    return control as FormArray;
  }

  getMaterialsArray(itemGroup: AbstractControl): FormArray {
    return itemGroup.get('materials') as FormArray;
  }

  getAddOnsArray(itemGroup: AbstractControl): FormArray {
    return itemGroup.get('addOns') as FormArray;
  }

  getMaterialsControls(itemGroup: AbstractControl): any[] {
    const materialsArray = itemGroup.get('materials') as FormArray;
    return materialsArray ? materialsArray.controls : [];
  }

  getAddOnsControls(itemGroup: AbstractControl): any[] {
    const addOnsArray = itemGroup.get('addOns') as FormArray;
    return addOnsArray ? addOnsArray.controls : [];
  }

  updateOrderStatus(): void {
    if (!this.order?.id || !this.selectedStatus) return;

    this.submitting = true;
    this.customOrderService.updateOrderStatus(this.order.id.toString(), this.selectedStatus)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => {
          if (this.order) {
            this.order.status = this.selectedStatus;
          }
          this.toasterService.showSuccess('Success', 'Order status updated successfully');
        },
        error: (error: Error) => {
          this.toasterService.showError('Error', error.message || 'Failed to update order status');
        }
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

import { CustomOrderService } from '../../../services/orders/custom-order.service';
import { AppointmentDetails } from '../../../models/appointment';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterLink,
    BreadcrumbComponent
  ],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ])
  ]
})
export class AppointmentDetailsComponent implements OnInit {
  appointmentId: string = '';
  appointment: AppointmentDetails | null = null;
  loading: boolean = false;
  error: string = '';
  rescheduleForm: FormGroup;
  submitting: boolean = false;
  showRescheduleForm: boolean = false;

  statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
     { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  timeSlots = [
    {key: 'morning', label: 'Morning', value: '(9 AM-12 PM)'},
    {key: 'afternoon', label: 'Afternoon', value: '(1 PM-5 PM)'},
    {key: 'evening', label: 'Evening', value: '(6 PM-8 PM)'}
  ];
  // <mat-option value="morning">Morning (9 AM - 12 PM)</mat-option>
  // <mat-option value="afternoon">Afternoon (1 PM - 5 PM)</mat-option>
  // <mat-option value="evening">Evening (6 PM - 8 PM)</mat-option>
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Appointments', url: '/appointments' },
    { label: 'Appointment Details' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customOrderService: CustomOrderService,
    private fb: FormBuilder,
    private toasterService: ToasterService
  ) {
    this.rescheduleForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.appointmentId) {
      this.loadAppointmentDetails();
    } else {
      this.error = 'Appointment ID is missing';
    }
  }

  loadAppointmentDetails(): void {
    this.loading = true;
    this.error = '';

    this.customOrderService.getAppointmentDetails(this.appointmentId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (appointment) => {
          this.appointment = appointment;
          if(this.appointment) {
            this.appointment.appointment.timeSlot = this.appointment.appointment.timeSlot
            .replace(/morning/i, 'Morning\n 9 AM - 12 PM')
            .replace(/afternoon/i, 'Afternoon\n 1 PM - 5 PM')
            .replace(/evening/i, 'Evening\n 6 PM - 8 PM');
                    }
          this.breadcrumbs[2].label = `Appointment #${appointment.id}`;
        },
        error: (err) => {
          this.error = 'Failed to load appointment details: ' + err.message;
          this.toasterService.showError('Error', 'Failed to load appointment details');
        }
      });
  }

  toggleRescheduleForm(): void {
    this.showRescheduleForm = !this.showRescheduleForm;
    if (this.showRescheduleForm && this.appointment) {
      // Initialize form with current values
      const currentDate = new Date(this.appointment.appointment.date);

      // Find the key that corresponds to the current time slot text
      let timeSlotKey = '';
      const currentTimeSlot = this.timeSlots.find(slot =>
        slot.value === this.appointment?.appointment?.timeSlot
      );

      if (currentTimeSlot) {
        timeSlotKey = currentTimeSlot.key;
      } else {
        // Default to afternoon if we can't find a match
        timeSlotKey = 'afternoon';
      }

      this.rescheduleForm.patchValue({
        date: currentDate,
        timeSlot: timeSlotKey,
        notes: ''
      });
    }
  }

  rescheduleAppointment(): void {
    if (this.rescheduleForm.invalid) {
      Object.keys(this.rescheduleForm.controls).forEach(key => {
        const control = this.rescheduleForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.submitting = true;
    const formValue = this.rescheduleForm.value;

    // Handle date properly without timezone issues
    const dateObj = new Date(formValue.date);

    // Use a simpler approach: set hours to 12 to avoid any date shifting due to UTC conversion
    // and then extract year, month, and day to create a properly formatted date string
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Get the full text for the selected time slot
    const selectedTimeSlot = this.timeSlots.find(slot => slot.key === formValue.timeSlot);
    const timeSlotText = selectedTimeSlot ? selectedTimeSlot.value : formValue.timeSlot;

    this.customOrderService.rescheduleAppointment(
      this.appointmentId,
      formattedDate,
      timeSlotText,
      formValue.notes
    )
    .pipe(finalize(() => this.submitting = false))
    .subscribe({
      next: (response) => {
        // Update local data
        if (this.appointment) {
          this.appointment.appointment.date = formattedDate;
          this.appointment.appointment.timeSlot = timeSlotText;
          this.appointment.appointment.status = 'rescheduled';
          this.appointment.appointment.notes = formValue.notes;
        }
        this.showRescheduleForm = false;
        this.toasterService.showSuccess('Success', 'Appointment rescheduled successfully');
      },
      error: (err) => {
        this.toasterService.showError('Error', 'Failed to reschedule appointment: ' + err.message);
      }
    });
  }

  updateStatus(status: string): void {
    this.submitting = true;

    this.customOrderService.updateAppointmentStatus(this.appointmentId, status)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => {
          if (this.appointment) {
            this.appointment.appointment.status = status;
          }
          this.toasterService.showSuccess('Success', 'Appointment status updated');
        },
        error: (err) => {
          this.toasterService.showError('Error', 'Failed to update appointment status: ' + err.message);
        }
      });
  }

  viewOrder(): void {
    if (this.appointment) {
      this.router.navigate(['/custom-orders', this.appointment.appointment.orderId]);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'rescheduled': return 'status-rescheduled';
      default: return '';
    }
  }
}

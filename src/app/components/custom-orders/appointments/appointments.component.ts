import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { CustomOrderService } from '../../../services/orders/custom-order.service';
import { MeasurementAppointment } from '../../../models/custom-order';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb.component';
import { ToasterService } from '../../../services/toatser.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
     FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    BreadcrumbComponent
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<MeasurementAppointment>([]);
  displayedColumns: string[] = ['date', 'timeSlot', 'item', 'customer', 'status', 'actions'];
  loading = false;
  error = '';
  statusFilter = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Measurement Appointments', url: '/appointments' }
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
     { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private customOrderService: CustomOrderService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';

    this.customOrderService.getMeasurementAppointments()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (appointments) => {
          this.dataSource.data = appointments;
          this.dataSource.data.map(appointment => {
            appointment.appointment.timeSlot = appointment.appointment.timeSlot
            .replace(/morning/i, 'Morning\n 9 AM - 12 PM')
            .replace(/afternoon/i, 'Afternoon\n 1 PM - 5 PM')
            .replace(/evening/i, 'Evening\n 6 PM - 8 PM');
          });
          this.applyFilters();
        },
        error: (err) => {
          this.error = 'Failed to load appointments: ' + err.message;
          // this.toasterService.openToaster();
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter() {
    this.applyFilters();
  }

  private applyFilters() {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchMatch = !filter ||
        data.customerInfo.name.toLowerCase().includes(filter.toLowerCase()) ||
        data.customerInfo.email.toLowerCase().includes(filter.toLowerCase()) ||
        data.customerInfo.phone.toLowerCase().includes(filter.toLowerCase()) ||
        data.item.itemName.toLowerCase().includes(filter.toLowerCase());

      const statusMatch = !this.statusFilter || data.appointment.status === this.statusFilter;

      return searchMatch && statusMatch;
    };

    // Trigger filter
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  updateStatus(appointment: MeasurementAppointment, status: string) {
    this.customOrderService.updateAppointmentStatus(appointment.id.toString(), status)
      .subscribe({
        next: () => {
          // Update the status locally to avoid reloading all appointments
          appointment.appointment.status = status;
          this.toasterService.showSuccess('Success', 'Appointment status updated');
        },
        error: (err) => {
          this.toasterService.showError('Error', 'Failed to update appointment status: ' + err.message);
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
       case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'rescheduled': return 'status-rescheduled';
      default: return '';
    }
  }

  viewOrder(orderId: number) {
    window.open(`/custom-orders/${orderId}`, '_blank');
  }

  viewAppointment(appointmentId: number) {
    this.router.navigate(['/appointments', appointmentId]);
  }
}

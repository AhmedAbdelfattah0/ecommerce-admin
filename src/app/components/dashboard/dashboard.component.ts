import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

interface RecentOrder {
  id: number;
  date: Date;
  customer: string;
  total: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule]
})
export class DashboardComponent implements OnInit {
  // Sales metrics
  totalSales: number = 15342.65;
  totalOrders: number = 156;
  averageOrder: number = 98.35;
  totalProducts: number = 85;

  // Recent orders
  recentOrders: RecentOrder[] = [];
  displayedColumns: string[] = ['id', 'date', 'customer', 'total', 'status'];

  constructor() { }

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  loadRecentOrders(): void {
    // Mock data for demonstration
    this.recentOrders = [
      {
        id: 1023,
        date: new Date('2023-05-15'),
        customer: 'John Smith',
        total: 129.99,
        status: 'Completed'
      },
      {
        id: 1022,
        date: new Date('2023-05-14'),
        customer: 'Sarah Johnson',
        total: 89.50,
        status: 'Processing'
      },
      {
        id: 1021,
        date: new Date('2023-05-13'),
        customer: 'Michael Brown',
        total: 215.75,
        status: 'Completed'
      },
      {
        id: 1020,
        date: new Date('2023-05-12'),
        customer: 'Emma Williams',
        total: 65.20,
        status: 'Shipped'
      },
      {
        id: 1019,
        date: new Date('2023-05-11'),
        customer: 'David Jones',
        total: 178.45,
        status: 'Completed'
      }
    ];
  }
}

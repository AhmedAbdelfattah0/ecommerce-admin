import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NewOrdersDialogComponent } from '../../components/dialogs/new-orders-dialog/new-orders-dialog.component';

interface NewOrdersResponse {

  new_orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private newOrdersSubject = new BehaviorSubject<number>(0);
  newOrders$ = this.newOrdersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  startNewOrdersCheck(): void {
    interval(this.CHECK_INTERVAL)
      .pipe(
        switchMap(() => this.checkNewOrders())
      )
      .subscribe();
  }

  checkNewOrders(): Observable<NewOrdersResponse> {
    return this.http.get<NewOrdersResponse>('/orders/check-new-orders.php').pipe(
      tap(response => {
        if (  response.new_orders > 0) {
          this.newOrdersSubject.next(response.new_orders);
          this.showNewOrdersNotification(response.new_orders);
        }
      })
    );
  }

  private showNewOrdersNotification(count: number): void {
    const dialogRef = this.dialog.open(NewOrdersDialogComponent, {
      width: '400px',
      data: { count },
      position: { top: '20px', right: '20px' },
      panelClass: 'notification-dialog'
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      dialogRef.close();
    }, 10000);
  }
}

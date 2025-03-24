import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sideNavOpenSubject = new BehaviorSubject<boolean>(true);
  sideNavOpen$ = this.sideNavOpenSubject.asObservable();

  toggleSideNav(): void {
    this.sideNavOpenSubject.next(!this.sideNavOpenSubject.value);
  }

  getSideNavState(): boolean {
    return this.sideNavOpenSubject.value;
  }
}

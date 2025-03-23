import { Injectable, signal } from '@angular/core';
import { toasterCases } from '../common/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  // toasterObject:BehaviorSubject<any> =new BehaviorSubject(toasterCases.DEFAULT)
  toasterObject = signal<any>(toasterCases.DEFAULT)
  constructor() {
  }

  openToaster(toasterObject:any){
     return this.toasterObject.set(toasterObject)
  }

}

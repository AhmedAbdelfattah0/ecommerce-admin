import { Injectable, signal } from '@angular/core';
import { toasterCases } from '../common/constants/app.constants';

export interface ToasterConfig {
  toasterType?: string;
  isVisible?: boolean;
  viewLink?: {
    link: string;
    isVisible: boolean;
  };
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  Message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  // toasterObject:BehaviorSubject<any> =new BehaviorSubject(toasterCases.DEFAULT)
  toasterObject = signal<ToasterConfig>(toasterCases.DEFAULT)
  constructor() {
  }

  openToaster(config: ToasterConfig){
     return this.toasterObject.set(config)
  }

  showSuccess(title: string, message: string) {
    this.openToaster({
      toasterType: 'SUCCESS',
      isVisible: true,
      title,
      message,
      type: 'success',
      Message: message // For backward compatibility
    });
  }

  showError(title: string, message: string) {
    this.openToaster({
      toasterType: 'ERROR',
      isVisible: true,
      title,
      message,
      type: 'error',
      Message: message // For backward compatibility
    });
  }

  showInfo(title: string, message: string) {
    this.openToaster({
      toasterType: 'INFO',
      isVisible: true,
      title,
      message,
      type: 'info',
      Message: message // For backward compatibility
    });
  }

  showWarning(title: string, message: string) {
    this.openToaster({
      toasterType: 'WARNING',
      isVisible: true,
      title,
      message,
      type: 'warning',
      Message: message // For backward compatibility
    });
  }
}

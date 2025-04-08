import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './common/services/http-interceptor.interceptor';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideToastr({
      timeOut: 8000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      progressBar: true,
      closeButton: true,
      progressAnimation: 'decreasing',
      easing: 'ease-in-out',
      easeTime: 300,

      newestOnTop: true,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      }
    })
  ]
};

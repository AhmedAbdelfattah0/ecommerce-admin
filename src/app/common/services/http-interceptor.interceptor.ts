import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


export function httpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  let apiUrl =''
    if(!req.url.includes('.json')){
     apiUrl = environment.apiUrl
  }
  const apiReq = req.clone({ url: `${apiUrl}${req.url}` });
  return next(apiReq);
}

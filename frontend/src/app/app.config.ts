import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {  HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

export const LogInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  console.log('Logged Request =>', req.url, req.method, req.headers, req.body);

  return next(req);
}

export const TokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  
  const reqClonada = req.clone({
    setHeaders: {
      'Authorization': sessionStorage.getItem("BearerToken") || ''
    }
  });

  return next(reqClonada);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        TokenInterceptor,
        //LogInterceptor
      ]),
      withInterceptorsFromDi()
    )
  ]
};

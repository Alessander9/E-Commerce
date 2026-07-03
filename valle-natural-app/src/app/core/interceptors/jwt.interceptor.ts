import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, timeout, Observable } from 'rxjs';
import { Router } from '@angular/router';

// Module-level state — reset properly on every failure
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function resetRefreshState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthEndpoint = req.url.includes('/auth/login')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/refresh');

  let authReq = req;

  // Add withCredentials to all backend API calls to allow browser to send HttpOnly cookies
  if (req.url.includes('/api/v1/')) {
    authReq = req.clone({ withCredentials: true });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse
        && (error.status === 401 || error.status === 403)
        && !isAuthEndpoint) {
        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<any>> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        if (response.success) {
          isRefreshing = false;
          refreshTokenSubject.next('refreshed');
          return next(req.clone({ withCredentials: true }));
        }
        // Refresh returned non-success
        resetRefreshState();
        authService.logout().subscribe();
        router.navigate(['/login']);
        return throwError(() => new Error('Refresh failed'));
      }),
      catchError((err) => {
        resetRefreshState();
        authService.logout().subscribe();
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );

  } else {
    // Wait up to 10s for refresh to complete, then retry
    return refreshTokenSubject.pipe(
      filter(t => t !== null),
      take(1),
      timeout(10000),
      switchMap(() =>
        next(req.clone({ withCredentials: true }))
      ),
      catchError((err) => {
        resetRefreshState();
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }
}

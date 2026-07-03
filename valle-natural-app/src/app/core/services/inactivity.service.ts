import { Injectable, inject, NgZone, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Subject, fromEvent, merge, throttleTime, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // Inactivity timeout threshold: 15 minutes (15 * 60 * 1000 = 900,000 ms)
  private readonly timeoutMs = 15 * 60 * 1000;
  private timeoutId: any;
  private subscription?: Subscription;

  constructor() {
    // Reactively start or stop monitoring based on user authentication signal
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    });
  }

  startMonitoring(): void {
    this.stopMonitoring();

    // Only monitor if the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Run outside Angular zone for performance, as user interaction events trigger digest cycles
    this.ngZone.runOutsideAngular(() => {
      const mouseMove$ = fromEvent(window, 'mousemove');
      const click$ = fromEvent(window, 'click');
      const scroll$ = fromEvent(window, 'scroll');
      const keypress$ = fromEvent(window, 'keypress');

      // Merge and throttle events to once every 2 seconds to minimize overhead
      const activity$ = merge(mouseMove$, click$, scroll$, keypress$).pipe(
        throttleTime(2000)
      );

      this.subscription = activity$.subscribe(() => {
        this.ngZone.run(() => {
          this.resetTimer();
        });
      });

      this.ngZone.run(() => {
        this.resetTimer();
      });
    });
  }

  stopMonitoring(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutMs);
  }

  private handleTimeout(): void {
    this.stopMonitoring();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login'], { queryParams: { reason: 'expired' } });
    });
  }
}

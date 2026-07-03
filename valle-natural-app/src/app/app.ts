import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { InactivityService } from './core/services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ALLMARA SUPERFOODS');
  protected readonly isLoading = signal(true);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inactivityService = inject(InactivityService);

  constructor() {
    this.syncSeo();
    this.bootstrapLoadingScreen();
  }

  private syncSeo(): void {
    const updateSeo = () => {
      const route = this.getDeepestRoute(this.activatedRoute);
      const data = route.snapshot.data ?? {};
      const url = this.document.location?.href ?? this.document.baseURI;
      const title = data['title'] || 'ALLMARA SUPERFOODS | Productos naturales, superfoods y bienestar';
      const description = data['description'] || 'Compra superfoods, miel, frutos secos, suplementos y productos naturales con atención rápida por WhatsApp.';
      const robots = data['robots'] || 'index,follow';
      const ogType = data['ogType'] || 'website';

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ name: 'robots', content: robots });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:type', content: ogType });
      this.metaService.updateTag({ property: 'og:url', content: url });
      this.metaService.updateTag({ property: 'og:site_name', content: 'ALLMARA SUPERFOODS' });
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });

      const canonical = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (canonical) {
        canonical.href = url.split('#')[0];
      }
    };

    updateSeo();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(updateSeo);
  }

  private bootstrapLoadingScreen(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        window.setTimeout(() => this.isLoading.set(false), 450);
      });

    window.setTimeout(() => {
      if (this.isLoading()) {
        this.isLoading.set(false);
      }
    }, 2500);
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}

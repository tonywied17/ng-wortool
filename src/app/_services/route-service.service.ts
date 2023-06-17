import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private routeChangeCount = 0;
  private routeHistory: string[] = [];
  private showButtonSubject = new BehaviorSubject<boolean>(false);
  showButton$ = this.showButtonSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;

        if (this.routeChangeCount === 0) {
          this.showButtonSubject.next(false);
          this.routeChangeCount++;
        } else if (this.routeChangeCount >= 1) {
          this.routeHistory.push(currentUrl);
          this.showButtonSubject.next(true);
        }
      }
    });
  }
}

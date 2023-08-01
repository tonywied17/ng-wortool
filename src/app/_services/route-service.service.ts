/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\route-service.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:36:58 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

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

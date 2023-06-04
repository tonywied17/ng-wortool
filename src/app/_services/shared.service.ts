import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private logoutEvent = new Subject<void>();

  // Observable stream of logout events
  logoutEvent$ = this.logoutEvent.asObservable();

  // Trigger the logout event
  triggerLogoutEvent() {
    this.logoutEvent.next();
  }

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();


  setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }
  constructor() { }
}

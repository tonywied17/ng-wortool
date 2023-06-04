import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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
  constructor() { }
}

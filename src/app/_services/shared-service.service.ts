/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\shared.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed November 22nd 2023 3:14:51 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

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


  /**
   * Set is logged in
   * This observable is used to set the logged in status
   * @param isLoggedIn - boolean - the logged in status
   */
  setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }
  constructor() { }
}
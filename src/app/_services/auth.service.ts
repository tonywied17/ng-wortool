/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\auth.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu November 16th 2023 7:09:38 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

const AUTH_API = 'https://api.tonewebdesign.com/pa/auth/';
const VET_API = 'https://api.tonewebdesign.com/pa/vet/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

/**
 * Authentication service
 */
export class AuthService {
  authenticationEvent: Subject<void> = new Subject<void>();
  private isAuthed: boolean = false;
  private isMod: boolean = false;
  private isAdmin: boolean = false;

  constructor(private http: HttpClient) { }

  /**
   * Getters and setters
   */

  /**
   * isAdministrator
   * @returns {boolean}
   */
  get isAdministrator(): boolean {
    return this.isAdmin;
  }

  /**
   * isAdministrator
   * @sets {boolean}
   */
  set isAdministrator(value: boolean) {
    this.isAdmin = value;
  }

  /**
   * isModerator
   * @returns {boolean}
   */
  get isModerator(): boolean {
    return this.isMod;
  }

  /**
   * isModerator
   * @sets {boolean}
   */
  set isModerator(value: boolean) {
    this.isMod = value;
  }

  /**
   * isAuthenticated
   * @returns {boolean}
   */
  get isAuthenticated(): boolean {
    return this.isAuthed;
  }

  /**
   * isAuthenticated
   * @sets {boolean}
   */
  set isAuthenticated(value: boolean) {
    this.isAuthed = value;
  }

  /**
   * login observable
   * This obseravable is used to login a user
   * @param username 
   * @param password 
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      username,
      password
    }, httpOptions);
  }

  /**
   * register observable
   * This obseravable is used to register a user
   * @param username 
   * @param email 
   * @param password 
   */
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username,
      email,
      password
    }, httpOptions);
  }

  /**
   * password observable
   * This obseravable is used to change a users password
   * @param id 
   * @param passwordCurrent 
   * @param passwordNew 
   */
  password(id: string, passwordCurrent: string, passwordNew: string): Observable<any> {
    return this.http.put(AUTH_API + id + '/updatePassword', {
      passwordCurrent,
      passwordNew
    }, httpOptions);
  }

  /**
   * profile observable
   * This obseravable is used to update a users profile
   * @param id 
   * @param email 
   * @param avatar_url 
   * @param discordId 
   * @param regimentId 
   */
  profile(id: string, email: string, avatar_url: string, discordId: string, regimentId: string): Observable<any> {
    return this.http.put(AUTH_API + id + '/updateProfile', {
      email,
      avatar_url,
      discordId,
      regimentId
    }, httpOptions);
  }

  /**
   * checkUserRole observable
   * This obseravable is used to check a users role
   * @param userId 
   */
  checkUserRole(userId: string): Observable<any> {
    const url = VET_API + 'user';
    const body = { userId: userId };
    return this.http.post(url, body);
  }
  
  /**
   * checkModeratorRole observable
   * This obseravable is used to check a users role
   * @param userId 
   * @param regimentId 
   */
  checkModeratorRole(userId: string, regimentId: any): Observable<any> {
    const url = VET_API + 'mod';
    const body = { userId: userId, regimentId: regimentId };
    return this.http.post(url, body);
  }
  
  /**
   * checkAdminRole observable
   * This obseravable is used to check a users role
   * @param userId 
   */
  checkAdminRole(userId: string): Observable<any> {
    const url = VET_API + 'admin';
    const body = { userId: userId };
    return this.http.post(url, body);
  }
  
  /**
   * Forgot Password (Send Email)
   * @param email 
   * @returns 
   */
  forgot(email: string): Observable<any> {
    return this.http.post(AUTH_API + 'forgot', { email }, httpOptions);
  }

  /**
   * Reset Password with token and new password
   * @param token 
   * @param newPassword 
   * @returns 
   */
  reset(token: string, newPassword: string): Observable<any> {
    return this.http.post(AUTH_API + `reset/${token}`, { newPassword }, httpOptions);
  }
  
}

/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\token-storage.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:40:08 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private roles: string[] = [];

  constructor() { }

  /**
   * Sign out
   * This function is used to sign out the user
   */
  signOut(): void {
    // window.localStorage.clear();
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  /**
   * Save token
   * This function is used to save the token
   * @param token - string - the token
   */
  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get token
   * This function is used to get the token
   * @returns - string | null
   */
  public getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Save user
   * This function is used to save the user
   * @param user - any - the user
   */
  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.roles = user.roles;
  }

  /**
   * Get user
   * This function is used to get the user
   * @returns - any
   */
  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  /**
   * Is moderator
   * This function is used to check if the user is a moderator
   * @returns 
   */
  public isModerator(): boolean {
    return this.roles.includes('ROLE_MODERATOR');
  }

  /**
   * Is authenticated
   * This function is used to check if the user is authenticated
   * @returns - boolean
   */
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Is admin
   * This function is used to check if the user is an admin
   * @returns - boolean
   */
  public isAdmin(): boolean {
    return this.roles.includes('ROLE_ADMIN');
  }
}

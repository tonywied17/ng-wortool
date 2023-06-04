import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private roles: string[] = [];

  constructor() { }

  signOut(): void {
    window.localStorage.clear();
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.roles = user.roles;
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  public isModerator(): boolean {
    // Add your logic here to determine if the current user is a moderator
    // For example, you can check the roles of the user or any other condition
    // and return true or false accordingly
    return this.roles.includes('ROLE_MODERATOR');
  }

  public isAuthenticated(): boolean {
    // Add your logic here to determine if the user is authenticated
    // For example, you can check if the token exists or any other condition
    // and return true or false accordingly
    return !!this.getToken();
  }

  public isAdmin(): boolean {
    // Add your logic here to determine if the current user is an administrator
    // For example, you can check the roles of the user or any other condition
    // and return true or false accordingly
    return this.roles.includes('ROLE_ADMIN');
  }
}

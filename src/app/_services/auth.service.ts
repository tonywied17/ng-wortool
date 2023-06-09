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
export class AuthService {
  authenticationEvent: Subject<void> = new Subject<void>();
  private isAuthed: boolean = false;
  private isMod: boolean = false;
  private isAdmin: boolean = false;

  constructor(private http: HttpClient) { }

  get isAdministrator(): boolean {
    return this.isAdmin;
  }

  set isAdministrator(value: boolean) {
    this.isAdmin = value;
  }

  get isModerator(): boolean {
    return this.isMod;
  }

  set isModerator(value: boolean) {
    this.isMod = value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthed;
  }

  set isAuthenticated(value: boolean) {
    this.isAuthed = value;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      username,
      password
    }, httpOptions);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username,
      email,
      password
    }, httpOptions);
  }

  password(id: string, passwordCurrent: string, passwordNew: string): Observable<any> {
    return this.http.put(AUTH_API + id + '/updatePassword', {
      passwordCurrent,
      passwordNew
    }, httpOptions);
  }

  profile(id: string, email: string, avatar_url: string, discordId: string): Observable<any> {
    return this.http.put(AUTH_API + id + '/updateProfile', {
      email,
      avatar_url,
      discordId
    }, httpOptions);
  }

  checkUserRole(userId: string): Observable<any> {
    const url = VET_API + 'user/' + userId;
    return this.http.get(url, httpOptions);
  }

  checkModeratorRole(userId: string): Observable<any> {
    const url = VET_API + 'mod/' + userId;
    return this.http.get(url, httpOptions);
  }

  checkAdminRole(userId: string): Observable<any> {
    const url = VET_API + 'admin/' + userId;
    return this.http.get(url, httpOptions);
  }
}

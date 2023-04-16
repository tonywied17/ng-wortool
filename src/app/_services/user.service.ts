import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user.model';

const API_URL = 'https://api.tonewebdesign.com/pa/muster/';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}`, user);
  }

  updateUser(user: User): Observable<any> {
    console.log(`${user.id} - ${user.nickname} | ev: ${user.events}, dr: ${user.drills}`)
    return this.http.put(`${API_URL}${user.id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_URL}${id}`);
  }

}

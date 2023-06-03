import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'https://api.tonewebdesign.com/pa/weapons';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class WeaponService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(API + '/', { responseType: 'text' });
  }

  get(id: string): Observable<any> {
    return this.http.get(API + '/' + id, { responseType: 'text' });
  }

  create(weapon: string, range: string, length: string, ammo: string, notes: string): Observable<any> {
    return this.http.post(API + '/', {
      weapon,
      range,
      length, 
      ammo, 
      notes 
    }, httpOptions);
  }
}



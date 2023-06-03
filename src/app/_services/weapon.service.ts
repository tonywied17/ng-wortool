import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Weapon } from '../_models/weapon';

const API = 'https://api.tonewebdesign.com/pa/weapons';

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

  create(data: any): Observable<any> {
    return this.http.post(API + '/', data);
  }
}



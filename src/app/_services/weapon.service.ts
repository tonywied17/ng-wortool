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


  createOrUpdate(userId: string, weapon: string, type: string, range: string, lengthy: string, ammo: string, image: string, notes: string): Observable<Weapon> {
    const data = {
      userId: userId,
      weapon: weapon,
      type: type,
      range: range,
      lengthy: lengthy,
      ammo: ammo,
      image: image,
      notes: notes
    };
  
    return this.http.post<Weapon>(`${API}/${userId}`, data);
  }



  delete(userId: string, weaponId: string): Observable<any> {
    return this.http.delete(API + '/' + weaponId + '/' + userId);
  }



  
}



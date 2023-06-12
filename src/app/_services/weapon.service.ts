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


  /**
   * Get all Weapons
   * @returns 
   */
  getAll(): Observable<any> {
    return this.http.get(API + '/', { responseType: 'text' });
  }

  /**
   * Get a Weapon by ID
   * @param id 
   * @returns 
   */
  get(id: string): Observable<any> {
    return this.http.get(API + '/' + id, { responseType: 'text' });
  }

  /**
   * Create or Update a Weapon
   * @param userId 
   * @param weapon 
   * @param type 
   * @param range 
   * @param lengthy 
   * @param ammo 
   * @param image 
   * @param notes 
   * @param weaponId 
   * @returns 
   */
  createOrUpdate(userId: string, weapon: string, type: string, range: string, lengthy: string, ammo: string, image: string, notes: string, weaponId: string): Observable<Weapon> {
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
    return this.http.post<Weapon>(`${API}/u/${userId}/weapon/${weaponId}`, data);
  }

  /**
   * Delete a Weapon
   * @param userId 
   * @param weaponId 
   * @returns 
   */
  delete(userId: string, weaponId: string): Observable<any> {
    return this.http.delete( `${API}/u/${userId}/weapon/${weaponId}`);
  }



  
}



/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\weapon.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:42:43 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

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
   * This observable is used to get all Weapons from the database
   * @returns - Observable<any>
   */
  getAll(): Observable<any> {
    return this.http.get(API + '/', { responseType: 'text' });
  }


  /**
   * Get Weapon by id
   * This observable is used to get a Weapon by id from the database
   * @param id - string - the Weapon id
   * @returns - Observable<any> 
   */
  get(id: string): Observable<any> {
    return this.http.get(API + '/' + id, { responseType: 'text' });
  }


  /**
   * Create or update a Weapon
   * This observable is used to create or update a Weapon in the database
   * @param userId - string - the User id
   * @param weapon - string - the Weapon
   * @param type - string - the Weapon type
   * @param range - string - the Weapon range
   * @param lengthy - string - the Weapon lengthy
   * @param ammo - string - the Weapon ammo
   * @param image - string - the Weapon image
   * @param notes - string - the Weapon notes
   * @param weaponId - string - the Weapon id
   * @returns - Observable<Weapon>
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
    return this.http.post<Weapon>(`${API}/weapon/${weaponId}`, data);
  }

  /**
   * Delete a Weapon
   * This observable is used to delete a Weapon in the database
   * @param userId - string - the User id
   * @param weaponId - string - the Weapon id
   * @returns - Observable<any>
   */
  delete(userId: string, weaponId: string): Observable<any> {
    const options = {
      body: { userId: userId }
    };
    return this.http.delete(`${API}/weapon/${weaponId}`, options);
  }

}



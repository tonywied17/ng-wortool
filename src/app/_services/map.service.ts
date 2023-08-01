/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\map.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:26:17 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Map } from '../_models/map.model';

const baseUrl = 'https://api.tonewebdesign.com/pa/maps';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  /**
   * Get all maps
   * This observable is used to get all maps from the database
   * @returns - Observable<Map[]>
   */
  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(baseUrl);
  }

  /**
   * Get map by id
   * This observable is used to get a map by id from the database
   * @param id - string - the map id
   * @returns - Observable<Map[]>
   */
  get(id: any): Observable<Map[]> {
    return this.http.get<Map[]>(`${baseUrl}/${id}`);
  }
}

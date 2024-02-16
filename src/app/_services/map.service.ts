/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\map.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 16th 2024 2:22:25 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Map } from '../_models/map.model';

const baseUrl = 'https://api.wortool.com/v2/maps';

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
  

  getAllMaps(): Observable<Map[]> {
    return this.http.get<Map[]>(`${baseUrl}/new`);
  }

  getAllMapsVerbose(): Observable<Map[]> {
    return this.http.get<Map[]>(`${baseUrl}/new-verbose`);
  }

  getMap(id: any): Observable<Map[]> {
    return this.http.get<Map[]>(`${baseUrl}/${id}`);
  }

  createMap(map: any): Observable<any> {
    return this.http.post(`${baseUrl}/new`, map);
  }

  updateMap(id: any, map: any): Observable<any> {
    return this.http.put(`${baseUrl}/new/map/${id}`, map);
  }

  updateRegiment(regimentId: number, regimentData: any): Observable<any> {
    return this.http.put(`${baseUrl}/new/regiment/${regimentId}`, regimentData);
  }
  
  updateUnit(unitId: number, unitData: any): Observable<any> {
    return this.http.put(`${baseUrl}/new/unit/${unitId}`, unitData);
  }
  
  
}

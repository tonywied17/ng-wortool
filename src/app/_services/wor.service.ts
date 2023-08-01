/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\wor.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:43:02 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WorService {

  constructor(
    private http: HttpClient
  ) { }

    API = 'https://api.tonewebdesign.com/pa/wor/';

    /**
     * Get all recaps
     * This observable is used to get all recaps from the database
     * @returns - Observable<any>
     */
  getRecaps(): Observable<any> {
    return this.http.get(this.API + 'recaps');
  }
}

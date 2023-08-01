/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\scroll-position.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:37:09 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {

  constructor() { }

  previousScrollPosition!: number;

}

/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiment-info\regiment-info.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue August 1st 2023 12:17:44 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { RegimentService } from "../../_services/regiment.service";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-regiment-info',
  templateUrl: './regiment-info.component.html',
  styleUrls: ['./regiment-info.component.scss']
})
export class RegimentInfoComponent implements OnInit {
  regiment: any;
  regimentUsers: any;
  regimentID: any;
  isDataLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private regimentService: RegimentService
  ) { 
    this.regiment = {};
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const id = params["id"];
      this.regimentID = id;
      this.retrieveInitialData();
    });
  }

  /**
   * Get regiment and regiment users on init
   */
  async retrieveInitialData(): Promise<void> {
    await Promise.all([
      this.getRegiment(this.regimentID),
      this.fetchRegimentUsers()
    ]);

    this.isDataLoaded = true;
  }

  /**
   * Get regiment by id
   * @param id - regiment id
   */
  async getRegiment(id: any): Promise<void> {
    this.regiment = await firstValueFrom(this.regimentService.getRegiment(id));
    
  }

  /**
   * Get regiment users
   */
  async fetchRegimentUsers(): Promise<void> {
    this.regimentUsers = await firstValueFrom(this.regimentService.getRegimentUsers(this.regimentID));
    this.regiment.members = this.regimentUsers;
  }
  
  /**
   * Open url in new tab
   * @param url - url to open
   */
  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }
}

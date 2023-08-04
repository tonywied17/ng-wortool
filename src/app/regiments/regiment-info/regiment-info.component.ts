/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiment-info\regiment-info.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu August 3rd 2023 10:33:49 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { RegimentService } from "../../_services/regiment.service";
import { SteamApiService } from "../../_services/steam-api.service";
import { Location } from "@angular/common";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-regiment-info",
  templateUrl: "./regiment-info.component.html",
  styleUrls: ["./regiment-info.component.scss"],
})
export class RegimentInfoComponent implements OnInit {
  regiment: any;
  regimentUsers: any;
  regimentID: any;
  screenshots: any;
  randomScreenshot: string = "";
  gameDetails: any;
  isDataLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private regimentService: RegimentService,
    private steamApiService: SteamApiService,
    private location: Location,
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
      this.fetchRegimentUsers(),
      this.getScreenshots(),
    ]);

    this.isDataLoaded = true;
  }

  /**
   * Get screenshots
   * This function is used to get the screenshots for the game from steam api
   * @returns - promise
   */
  async getScreenshots(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.steamApiService.getAppDetails().subscribe(
        (data) => {
          this.gameDetails = data;
          this.screenshots = this.gameDetails.screenshots;
          this.randomScreenshot = this.getRandomScreenshot(this.screenshots);
          resolve();
        },
        (error) => {
          // handle error if needed
          reject(error);
        }
      );
    });
  }

  /**
   * Get random screenshot
   * This function is used to get a random screenshot from the screenshots array
   * @param screenshots - screenshots array
   * @returns - random screenshot url path
   */
  getRandomScreenshot(screenshots: any[]): string {
    if (screenshots && screenshots.length > 0) {
      const randomIndex = Math.floor(Math.random() * screenshots.length);
      return screenshots[randomIndex].path_full;
    }
    return "";
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
    this.regimentUsers = await firstValueFrom(
      this.regimentService.getRegimentUsers(this.regimentID)
    );
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

   /**
   * Go back
   * This function is used to go back to the previous page
   */
   goBack(): void {
    this.location.back();
  }
}

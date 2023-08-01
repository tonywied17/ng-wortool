/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\game-info\game-info.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:56:03 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { SteamApiService } from "../_services/steam-api.service";

@Component({
  selector: "app-game-info",
  templateUrl: "./game-info.component.html",
  styleUrls: ["./game-info.component.scss"],
})
export class GameInfoComponent implements OnInit {
  gameNews: any;
  gameDetails: any;
  headerImage: any;
  gameBackground: any;
  articleLength: any;
  latestAuthor: any;
  latestDate: any;
  screenshots: any;
  isDataLoaded: boolean = false;

  constructor(private steamApiService: SteamApiService) {}

  /**
   * On init
   */
  ngOnInit(): void {
    this.getAppDetails();
    this.getAppNews();
  }

  /**
   * Get app details
   * This function is used to get the app details for the game from steam api
   */
  getAppDetails(): void {
    this.steamApiService.getAppDetails().subscribe(
      (data) => {
        this.gameDetails = data;
        this.headerImage = this.gameDetails.header_image;
        this.gameBackground = this.gameDetails.background;
        this.screenshots = this.gameDetails.screenshots;
        this.isDataLoaded = true;
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  /**
   * Get app news
   * This function is used to get the app news for the game from steam api
   */
  getAppNews(): void {
    this.steamApiService.getAppNews().subscribe(
      (data) => {
        this.gameNews = data;
        this.articleLength = this.gameNews.length;
        this.latestAuthor = this.gameNews[0].author;
        this.latestDate = this.formatUnixTimestamp(this.gameNews[0].date);
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  /**
   * Format unix timestamp
   * This function is used to format the unix timestamp from steam api
   * @param unixTimestamp - unix timestamp
   * @returns - formatted date
   */
  formatUnixTimestamp(unixTimestamp: any): string {
    const date = new Date(unixTimestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: undefined,
      minute: undefined,
      second: undefined,
      timeZone: "UTC",
    };

    return date.toLocaleString(undefined, options);
  }

  /**
   * Navigate to external page
   * This function is used to navigate to an external page
   * @param url - url to navigate to
   */
  navigateToExternalPage(url: string): void {
    window.open(url, "_blank");
  }

  /**
   * Open in new popup window
   * This function is used to open a new window
   * @param url 
   * @param title 
   * @param w 
   * @param h 
   * @returns 
   */
  open(url: any, title: any, w: any, h: any) {
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  }
}

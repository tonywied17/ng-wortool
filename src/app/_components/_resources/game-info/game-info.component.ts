/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\game-info\game-info.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 12:23:04 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { SteamApiService } from "src/app/_services/steam-api.service";
import { MapImageModalComponent } from "../maps/map-image-modal/map-image-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";

@Component({
  selector: "app-game-info",
  templateUrl: "./game-info.component.html",
  styleUrls: ["./game-info.component.scss"],
})
export class GameInfoComponent implements OnInit {
  
  @ViewChild("dialogTemplate")
  _dialogTemplate!: TemplateRef<any>;
  private _overlayRef!: OverlayRef;
  private _portal!: TemplatePortal;

  gameNews: any;
  gameDetails: any;
  headerImage: any;
  gameBackground: any;
  articleLength: any;
  latestAuthor: any;
  latestDate: any;
  screenshots: any;
  isDataLoaded: boolean = false;
  

  constructor(
    private steamApiService: SteamApiService, 
    private dialog: MatDialog,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef) {}

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
        this.screenshots = this.shuffleArray(this.gameDetails.screenshots).slice(0, 8);
        this.isDataLoaded = true;
      },
      (error) => {
        // // console.log(error);
      }
    );
  }

  /**
   * Shuffle array
   * This function is used to shuffle the array
   * @param array 
   * @returns 
   */
  shuffleArray(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
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
        // // console.log(error);
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

  openImageModal(imageUrl: string): void {
    this.dialog.open(MapImageModalComponent, {
      data: { imageUrl },
    });
  }

    /**
   * on after view init
   */
    ngAfterViewInit() {
      this._portal = new TemplatePortal(
        this._dialogTemplate,
        this._viewContainerRef
      );
      this._overlayRef = this._overlay.create({
        positionStrategy: this._overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
        hasBackdrop: true,
      });
      this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
    }
  
    /**
     * on destroy
     */
    ngOnDestroy() {
      this._overlayRef.dispose();
    }
  
    /**
     * open dialog
     * This is a function that opens a dialog
     */
    openDialog() {
      this._overlayRef.attach(this._portal);
    }
  
    /**
     * close popup
     */
    closePopup() {
      if (this._overlayRef && this._overlayRef.hasAttached()) {
        this._overlayRef.detach();
      }
    }
}

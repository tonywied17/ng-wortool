/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\event-recaps\event-recaps.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri August 4th 2023 9:04:37 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { WorService } from "src/app/_services/wor.service";
import { RegimentService } from "src/app/_services/regiment.service";
import { MapService } from "src/app/_services/map.service";
import { SteamApiService } from "src/app/_services/steam-api.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-event-recaps",
  templateUrl: "./event-recaps.component.html",
  styleUrls: ["./event-recaps.component.scss"],
})
export class EventRecapsComponent implements OnInit {
  isDataLoaded: boolean = false;
  recaps: any;
  maps: any;
  gameDetails: any;
  screenshots: any;
  randomImages: any;
  players: any;
  steamPlayers: any;
  commaIDS: any;

  constructor(
    private worService: WorService,
    private regimentService: RegimentService,
    private steamApiService: SteamApiService,
    private mapService: MapService
  ) {}

  /**
   * On init, get all recaps and maps
   * @returns void
   */
  async ngOnInit(): Promise<void> {
    await this.getRecaps();
    await this.getMaps();
    await this.getAppDetails();
    this.isDataLoaded = true;
  }

  /**
   * Get app details from Steam API
   */
  async getAppDetails(): Promise<void> {
    try {
      const data = await this.steamApiService.getAppDetails().toPromise();
      this.gameDetails = data;
      this.screenshots = this.gameDetails.screenshots;
      this.assignRandomScreenshots();
    } catch (error) {}
  }

  /**
   * Assign random screenshots to recaps
   */
  assignRandomScreenshots(): void {
    this.recaps.forEach((recap: any) => {
      const randomIndex = Math.floor(Math.random() * this.screenshots.length);
      recap.randThumbnail = this.screenshots[randomIndex].path_thumbnail;
    });
  }

  /**
   * Helper function to get random image
   */
  randomImg(): void {
    this.recaps.forEach((recap: any) => {
      recap.randThumbnail =
        this.screenshots[
          Math.floor(Math.random() * this.screenshots.length)
        ].path_thumbnail;
    });
  }

  /**
   * Get all recaps
   */
  async getRecaps(): Promise<void> {
    try {
      this.recaps = await firstValueFrom(this.worService.getRecaps());
  
      if (this.recaps) {
        this.players = this.recaps.flatMap((recap: any) => recap.players || []);
      }
      
      this.commaIDS = this.players.map((player: any) => player.SteamID).join(",");
  
      this.steamPlayers = await this.getSteamUser(this.commaIDS);

  
      this.players.forEach((player: any) => {
        const steamPlayer = this.steamPlayers.find((steamPlayer: any) => steamPlayer.steamid === player.SteamID.toString());
        if (steamPlayer) {
          player.avatar = steamPlayer.avatar;
        }
      });
  
    } catch (error) {
      console.error(error);
    }
  }
  
  /**
   * Get steam user data for a comma separated list of steam ids
   * @param steamIds - comma separated list of steam ids
   * @returns 
   */
  async getSteamUser(steamIds: string): Promise<any> {
    try {
      const steamUser = await firstValueFrom(
        this.steamApiService.getSteamId(steamIds)
      );
  
  
      if (!steamUser || !steamUser.response) {
        console.error('Steam user or response is undefined');
        return [];
      }
  
      return steamUser.response.players;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  /**
   * Get all maps
   * @returns
   */
  async getMaps(): Promise<void> {
    this.maps = await firstValueFrom(this.mapService.getAll());
    this.recaps.forEach((recap: any) => {
      const matchingMap = this.maps.find(
        (map: any) => map.map.toLowerCase() === recap.area.toLowerCase()
      );
      if (matchingMap) {
        recap.mapObject = matchingMap;
      } else {
        recap.mapObject = { map: "No Map Data Found" };
      }
    });
  }

  /**
   * Convert epoch time to locale time
   * @param epochTime - epoch time
   * @returns 
   */
  convertToLocaleTime(epochTime: number): string {
    const date = new Date(epochTime * 1000); 

    return date.toLocaleString(); 
  }

  /**
   * Chunk array into smaller arrays
   * @param array - array to chunk
   * @param size - size of chunks
   * @returns 
   */
  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Filter players by team id
   * @param teamId - team id
   * @returns 
   */
  filterPlayersByTeamId(teamId: number): any[] {
    return this.recaps.players.filter(
      (player: { TeamId: number }) => player.TeamId === teamId
    );
  }
}
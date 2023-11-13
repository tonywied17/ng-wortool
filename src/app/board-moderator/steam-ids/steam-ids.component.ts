/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\steam-ids\steam-ids.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Saturday July 29th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun November 12th 2023 8:54:25 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { SteamApiService } from "src/app/_services/steam-api.service";
import { TokenStorageService } from "../../_services/token-storage.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-steam-ids",
  templateUrl: "./steam-ids.component.html",
  styleUrls: ["./steam-ids.component.scss"],
})
export class SteamIdsComponent implements OnInit {
  steamIdForm!: FormGroup;
  isLoggedIn = false;
  currentUser: any;
  regimentID: any;
  regimentData: any;
  regimentSelected = true;
  steamIds: any;
  addString: string = "<i class='fa-solid fa-plus mr-1'></i> Add Steam ID";
  gameIdForm: any;
  addingSteam: boolean = false;
  previewData: any;
  searchText: string = "";

  isDataLoaded = false;

  itemsPerPage = 3;
  currentPage = 1;
  paginatedSteamIds: any[] = [];
  allSteamIds: any[] = [];


  constructor(
    private token: TokenStorageService,
    private regimentService: RegimentService,
    private authService: AuthService,
    private steamApiService: SteamApiService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {}

  /**
   * @method ngOnInit
   */
  async ngOnInit(): Promise<void> {

    this.steamIdForm = this.formBuilder.group({
      gameIdForm: [""]
    });

    try {
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      const userID = this.currentUser.id;
      if (this.isLoggedIn) {
        await firstValueFrom(
          this.authService.checkModeratorRole(
            userID,
            this.currentUser.regimentId
          )
        );
        if (this.currentUser.regimentId) {
          this.regimentID = this.currentUser.regimentId;
          await this.getRegiment();
          await this.getSteamIds();
          this.allSteamIds = this.steamIds.slice();
        }
      }
    } catch (error: any) {
      if (error && error.status === 403) {
        this.regimentSelected = false;
      } else {
        console.error("Error:", error);
      }
    } finally {
      this.isDataLoaded = true;
    }
  }

  /**
   * @method getSteamId
   * @description extract value from steam data object
   * @param steamId - the steam id of the user
   * @param key - the key to get the value from
   * @returns - the value of the key
   */
  getValue(steamId: any, key: string) {
    const stat = steamId.liveGameStats.find((item: { name: string; }) => item.name === key);
    return stat ? stat.value : 'N/A';
  }
  
  /**
   * @method getStatValue
   * @description extract value from stats array
   * @param stats - the stats array
   * @param name - the name of the stat to get the value from
   * @returns - the value of the stat
   */
  getStatValue(stats: any[], name: any) {
    const stat = stats.find((s: { name: any; }) => s.name === name);
    return stat ? stat.value : null;
  }
  
  /**
   * @method getGameType
   * @description extract game type from stats array
   * @param name - the name of the stat to get the game type from
   * @returns - the game type
   */
  getGameType(name: any) {
    switch (name) {
      case 'STAT_GAMES_PLAYED_SKIRMISH':
        return "Skirmish's";
      case 'STAT_GAMES_PLAYED_CONQUEST':
        return "Conquest's";
      case 'STAT_GAMES_PLAYED_PICKETPATROL':
        return "Picket Patrol's";
      case 'STAT_GAMES_PLAYED_CONTENTION':
        return "Contention's";
      default:
        return '';
    }
  }
  
  /**
   * @method getGameType
   * @description extract game type from stats array
   * @param name - the name of the stat to get the game type from
   * @returns - the game type
   */
  async getRegiment(): Promise<void> {
    try {
      this.regimentData = await firstValueFrom(
        this.regimentService.getRegiment(this.regimentID)
      );
      this.regimentSelected = true;
    } catch {
      this.regimentSelected = false;
    }
  }

  /**
   * @method getSteamIds
   * @description get the steam ids for the regiment
   * @returns - the steam ids for the regiment
   */
  async getSteamIds(): Promise<void> {
    try {
      this.steamIds = await firstValueFrom(
        this.regimentService.getGameIds(this.currentUser.id, this.regimentID)
      );
      this.updatePaginatedSteamIds(); // Initialize the steamIds array with the data for the first page
    } catch {
      this.regimentSelected = false;
    }
  }

  /**
   * @method filterSteamIds
   * @description filter the steam ids for the regiment
   * @param searchText - the search text to filter the steam ids by
   * @returns - the filtered steam ids for the regiment
   */
  filterSteamIds(): void {
    if (!this.searchText) {
      this.steamIds = this.allSteamIds.slice(); 
      this.currentPage = 1; 
      this.updatePaginatedSteamIds(); 
      return;
    }
  
    const searchTextLowerCase = this.searchText.toLowerCase();
  
    this.steamIds = this.allSteamIds.filter((user: any) => {
      const nickname = user.nickname ? user.nickname.toLowerCase() : "";
      const steamId = user.steamId ? user.steamId.toLowerCase() : "";
      const personaname = user.liveSteamData
        ? user.liveSteamData.personaname.toLowerCase()
        : "";
  
      return (
        nickname.includes(searchTextLowerCase) ||
        steamId.includes(searchTextLowerCase) ||
        personaname.includes(searchTextLowerCase)
      );
    });
  
    this.currentPage = 1; 
    this.updatePaginatedSteamIds(); 
  }
  
  /**
   * @method updatePaginatedSteamIds
   * @description update the paginated steam ids for the regiment
   * @returns - the paginated steam ids for the regiment
   */
  updatePaginatedSteamIds(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedSteamIds = this.steamIds.slice(start, end);
  }
  
  /**
   * @method setGameId
   * @description set the game id for the regiment
   * @returns - the game id for the regiment
   */
  async setGameId(): Promise<void> {
    const gameIdFormControl = this.steamIdForm.get('gameIdForm');
    if (gameIdFormControl && gameIdFormControl.valid) {
      const steamId = gameIdFormControl.value;
      this.gameIdForm = steamId;
    }
    
    try {
      const userId = this.currentUser.id;
      const regimentId = this.currentUser.regimentId;

      const response: any = await firstValueFrom(
        this.regimentService.setGameId(userId, regimentId, this.gameIdForm)
      );

      if (response && response.message) {
        this.openSnackBar(response.message, 2000);
      } else {
        this.openSnackBar("Steam ID set successfully!", 2000);
      }

      this.getSteamIds();
      this.toggleAddingSteam();
    } catch (error: any) {
      console.error("An error occurred while setting the game ID:", error);
      this.openSnackBar("An error occurred while setting the game ID.", 2000);
    }
  }

  /**
   * @method getLevelData
   * @description get the level data for the xp
   * @param xp - the xp to get the level data for
   * @returns - the level data for the xp
   */
  getLevelData(xp: number): any {
    if (xp < 0 || !xp) {
      return "User has no experience.";
    }

    let n = 0;
    let s = 10000;
    let lvl = 0;
    let xpForCurrentLevel = 0;

    for (let i = 0; i < 100; ++i) {
      if (xp < n) {
        lvl = i;
        break;
      }

      xpForCurrentLevel = n;
      n += s;

      if (i !== 0 && i % 10 === 0) {
        s += 20000;
      }
    }

    if (lvl === 0) {
      lvl = 100;
      n -= s;
    } else {
      lvl = lvl - 1; 
    }

    const xpRq = n - xpForCurrentLevel; 
    const xpTowardsNextLevel = xp - xpForCurrentLevel; 
    const progress = (xpTowardsNextLevel / xpRq) * 100;

    const resObj = {
      lvl: lvl,
      xpRq: xpRq,
      xp: xpTowardsNextLevel,
      progress: progress,
    };

    return resObj;
  }

  /**
   * @method getSteamIdPreview
   * @description get the steam id preview for the entered steam id
   * @returns - the steam id preview data
   */
  getSteamIdPreview() {
    const gameIdFormControl = this.steamIdForm.get('gameIdForm');
  
    if (gameIdFormControl && gameIdFormControl.valid) {
      const steamId = gameIdFormControl.value;
  
      if (steamId.startsWith('https://steamcommunity.com/')) {
        // alert(`Hey, that's a profile! (${steamId})`);
  
        this.steamApiService.getIdsFromProfile(steamId).subscribe({
          next: (data) => {
            const steamId64 = data.steamId64;
            console.log(steamId64);
  
            this.getPlayerDataBySteamId64(steamId64);
          },
          error: (e) => console.error(e),
        });
      } else {
        this.getPlayerDataBySteamId64(steamId);
      }
    }
  }

  getPlayerDataBySteamId64(steamId64: string) {
    this.steamApiService.getSteamId(steamId64).subscribe(
      (data) => {
        if (data && data.response && data.response.players && data.response.players.length > 0) {
          this.previewData = data.response.players[0];
        } else {
          // Handled
        }
      },
      (err) => {
        console.error('Error occurred while fetching data:', err);
      }
    );
  }


  /**
   * @method getExperienceValue
   * @description get the experience value for the stats array
   * @param stats - the stats array
   * @returns - the experience value for the stats array
   */
  getExperienceValue(stats: any[]): number {
    if (!stats) {
      return 1;
    }

    const stat = stats.find(
      (stat) => stat.name === "STAT_PROGRESSION_EXPERIENCE"
    );
    return stat ? stat.value : 1;
  }

  /**
   * @method roundNumber
   * @description round the number to the nearest whole number
   * @param value - the value to round
   * @returns - the rounded number
   */
  roundNumber(value: number): number {
    return Math.round(value);
  }

  /**
   * @method toggleAddingSteam
   * @description toggle the adding steam id form
   * @returns - the adding steam id form
   */
  toggleAddingSteam(): void {
    this.addingSteam = !this.addingSteam;
    this.addString = this.addingSteam ? "<i class='fa-solid fa-xmark mr-1'></i> Cancel" : "<i class='fa-solid fa-plus mr-1'></i> Add Steam ID";
  }

  /**
   * @method openSnackBar
   * @description open the snack bar
   * @param message - the message to display in the snack bar
   * @param duration - the duration to display the snack bar for 
   */
  openSnackBar(message: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.horizontalPosition = "center";
    config.verticalPosition = "top";

    this._snackBar.open(message, "Okay", config);
  }

  /**
   * @method copyToClipboard
   * @param text - the text to copy to the clipboard
   */
  copyToClipboard(text: string) {
    this.clipboard.copy(text);
  }

  /**
   * @method openProfileUrl
   * @description open the profile url in a new tab
   * @returns - the profile url in a new tab
   */
  openProfileUrl() {
    const url = this.previewData?.profileurl;
    if (url) {
      window.open(url, '_blank');
    }
  }
  
  /**
   * @method convertTo12HourTime
   * @description convert the unix timestamp to 12 hour time
   * @param unixTimestamp - the unix timestamp to convert
   * @returns - the 12 hour time
   */
  convertTo12HourTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); 
    return date.toLocaleTimeString('en-US', { hour12: true });
  }

  /**
   * @method getPaginatedSteamIds
   * @description get the paginated steam ids
   * @param steamIds - the steam ids to paginate
   * @param currentPage - the current page of the steam ids
   * @param itemsPerPage - the number of items per page
   * @returns - the paginated steam ids
   */
  getPaginatedSteamIds() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.steamIds.slice(start, end);
  }

  /**
   * @method nextPage
   * @description go to the next page of steam ids
   * @returns - the next page of steam ids
   */
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePaginatedSteamIds(); 
    }
  }
  
  /**
   * @method previousPage
   * @description go to the previous page of steam ids
   * @returns - the previous page of steam ids
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedSteamIds(); 
    }
  }
  
  /**
   * @method getTotalPages
   * @description get the total number of pages
   * @param steamIds - the steam ids to get the total number of pages for
   * @param itemsPerPage - the number of items per page
   * @param currentPage - the current page of the steam ids
   * @param itemsPerPage - the number of items per page
   * @returns - the total number of pages
   */
  getTotalPages() {
    return Math.ceil(this.steamIds.length / this.itemsPerPage);
  }
  
  /**
   * @method goToPage
   * @description go to the specified page
   * @param steamIds - the steam ids to get the total number of pages for
   * @param itemsPerPage - the number of items per page
   * @param currentPage - the current page of the steam ids
   * @param itemsPerPage - the number of items per page
   * @returns - the total number of pages
   */
  goToPage(page: number) {
    if (page < 1) {
      page = 1;
    } else if (page > this.getTotalPages()) {
      page = this.getTotalPages();
    }
  
    this.currentPage = page;
    this.updatePaginatedSteamIds();
  }
  
  /**
   * @method shouldShowFirstEllipsis
   * @description show the first ellipsis
   * @deprecated - not used
   */
  shouldShowFirstEllipsis() {
    return this.currentPage > 3 && this.getTotalPages() > 3;
  }
  
  /**
   * @method shouldShowLastEllipsis
   * @description show the last ellipsis
   * @deprecated - not used
   */
  shouldShowLastEllipsis() {
    return this.getTotalPages() - this.currentPage > 2;
  }
  
  /**
   * @method getVisiblePages
   * @description get the visible pages
   * @returns - the visible pages
   */
  getVisiblePages() {
    const pages = [];
  
    pages.push(this.currentPage);
  
    if (this.getTotalPages() > 1) {
      if (this.currentPage < this.getTotalPages()) {
        pages.push(this.currentPage + 1);
      } else if (this.currentPage > 1) {
        pages.unshift(this.currentPage - 1);
      }
    }
  
    return pages;
  }
  
  /**
   * @method isCurrentPage
   * @description check if the page is the current page
   * @returns - the current page
   */
  isFormValid(): boolean {
    return this.steamIdForm.get("gameIdForm")?.valid || false;
  }

}
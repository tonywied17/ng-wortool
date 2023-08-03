/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiments.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu August 3rd 2023 7:15:58 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { RegimentService } from "../_services/regiment.service";
import { DiscordService } from "../_services/discord.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "app-regiments",
  templateUrl: "./regiments.component.html",
  styleUrls: ["./regiments.component.scss"],
})
export class RegimentsComponent implements OnInit {
  @ViewChild('overlayContainer', { static: false }) overlayContainer!: ElementRef;
  showOverlay: boolean = false;
  regiments: any;
  regimentID: any;
  searchText: any;
  isDataLoaded: boolean = false;
  currentRoute!: string;
  selectedSide: string = "all";
  itemsPerPage = 6;
  currentPage = 1;
  paginatedRegiments: any[] = [];
  allRegiments: any[] = [];

  constructor(
    private regimentService: RegimentService,
    private snackBar: MatSnackBar,
    private discordService: DiscordService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.showOverlay = false;
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.getRegiments();
  }

  /**
   * Filter regiments by the search text, or side
   * @returns void
   */
  filterRegiments() {
    this.regiments = this.allRegiments.filter((regiment: any) => {
      const searchTextMatch =
        !this.searchText ||
        regiment.regiment.toLowerCase().includes(this.searchText.toLowerCase());
  
      const sideMatch =
        this.selectedSide === 'all' || regiment.side === this.selectedSide;
  
      return searchTextMatch && sideMatch;
    });
  
    this.currentPage = 1; 
    this.updatePaginatedRegiments(); 
  }
  
  /**
   * Get all regiments and their users
   * This function will get all regiments and then fetch the users for each regiment
   */
  getRegiments() {
    this.regimentService.getRegiments().subscribe((regiments) => {
      this.regiments = regiments;
      
      this.fetchRegimentDiscordData();
      //
      this.allRegiments = this.regiments.slice();
      console.log("regiments", regiments);
    });
  }

  /**
   * Fetch all users for each regiment
   * @returns void
   */
  async fetchRegimentDiscordData(): Promise<void> {
    const fetchPromises = this.regiments.map(async (regiment: any) => {
      await this.getDiscordRegimentData(regiment.guild_id, regiment);
    });
  
    await Promise.all(fetchPromises);
  }

  /**
   * Get the discord guild data for a regiment
   * This function will get the guild data for a regiment and then update the regiment data if it has changed
   * @param guildId - The guild id of the regiment
   * @param regiment - The regiment object
   */
  async getDiscordRegimentData(guildId: string, regiment: any): Promise<void> {
    await this.discordService
      .getRegimentGuild(guildId)
      .toPromise()
      .then((response: any) => {
        let hasChanged = false;

        regiment.memberCount = response.guild.memberCount;

        if (
          !regiment.guild_avatar ||
          regiment.guild_avatar !== response.guild.iconURL
        ) {
          regiment.guild_avatar = response.guild.iconURL;
          hasChanged = true;
        }

        if (regiment.regiment !== response.guild.name) {
          regiment.regiment = response.guild.name;
          hasChanged = true;
        }

        if (hasChanged) {
          const requestedDomain = window.location.origin + this.currentRoute;
          this.regimentService
            .syncRegiment(
              requestedDomain,
              regiment.userId,
              regiment.id,
              regiment.regiment,
              regiment.guild_id,
              regiment.guild_avatar,
              regiment.invite_link,
              regiment.website,
              regiment.description,
              regiment.side
            )
            .subscribe(
              (updatedRegiment: any) => {},
              (error: any) => {}
            );
        }

        this.isDataLoaded = true;
      });
  }

  /**
   * Open a url in a new tab
   * @param url - The url to open
   */
  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

  /**
   * Truncate text to a specified length
   * @param text - The text to truncate
   * @param maxLength - The max length of the text
   * @returns - The truncated text
   */
  ellipsisText(text: string, maxLength: number = 256): string {
    if (!text || text.trim() === '') {
      return 'No description available.';
    }
  
    if (text.length <= maxLength) {
      return text;
    }
  
    if (maxLength <= 3) {
      maxLength = 3;
    }
  
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Display a snackbar message that the feature is not yet available
   */
  notYet() {
    this.snackBar.open("This feature is not yet available", "OK", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  /**
   * @method getPaginatedSteamIds
   * @description get the paginated steam ids
   * @param steamIds - the steam ids to paginate
   * @param currentPage - the current page of the steam ids
   * @param itemsPerPage - the number of items per page
   * @returns - the paginated steam ids
   */
  getPaginatedRegiments() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.regiments.slice(start, end); 
  }
  
  /**
   * @method nextPage
   * @description go to the next page of steam ids
   * @returns - the next page of steam ids
   */
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePaginatedRegiments(); 
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
      this.updatePaginatedRegiments(); 
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
    return Math.ceil(this.regiments.length / this.itemsPerPage);
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
    this.updatePaginatedRegiments();
  }

    /**
   * @method updatePaginatedSteamIds
   * @description update the paginated steam ids for the regiment
   * @returns - the paginated steam ids for the regiment
   */
    updatePaginatedRegiments(): void {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedRegiments = this.regiments.slice(start, end);
    }

    /**
     * @method toggleOverlay
     * @description toggle the overlay
     * @returns - the overlay
     */
    toggleOverlay() {
      this.showOverlay = !this.showOverlay;
      // Add or remove click event listener based on the overlay display status
      if (this.showOverlay) {
        document.addEventListener('click', this.closeOverlayOnClickOutside);
      } else {
        document.removeEventListener('click', this.closeOverlayOnClickOutside);
      }
    }
  
    /**
     * @method closeOverlayOnClickOutside
     * @description close the overlay on click outside
     * @returns - the overlay
     * @param event - the mouse event
     */
    closeOverlayOnClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!this.overlayContainer.nativeElement.contains(target)) {
        this.toggleOverlay();
      }
    };

    /**
     * @method handleClickInside
     * @description handle the click inside the overlay (prevent propagation on click inside add bot div's)
     * @returns - the overlay
     * @param event - the mouse event
     */
    handleClickInside(event: MouseEvent): void {
      event.stopPropagation(); 
    }

    closeOverlay(event: MouseEvent) {
      event.stopPropagation();
      this.toggleOverlay();
    }
    
    
}

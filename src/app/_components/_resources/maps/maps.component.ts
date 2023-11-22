/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\maps\maps.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed November 22nd 2023 11:27:54 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { FavoriteService } from "src/app/_services/favorite.service";
import { Map } from "src/app/_models/map.model";

@Component({
  selector: "app-maps",
  templateUrl: "./maps.component.html",
  styleUrls: ["./maps.component.scss"],
})
export class MapsComponent implements OnInit {
  map?: Map[];
  currentMap: Map = {};
  currentIndex = -1;
  showMapPage = false;
  loading = true;
  currentUser: any;
  isLoggedIn = false;
  originalMap?: Map[];
  searchText: string = "";
  selectedCampaign: string = "";
  selectedCampaigns: string[] = [];
  uniqueCampaigns: string[] = [];
  filterByCampaign = true;
  filterByCampaignDiv: any;

  filterByAttacker = false;
  filterByCsaAttacker = false;
  filterByUsaAttacker = false;
  selectedAttacker: string | undefined;

  filterByArtillery = false;
  filterByUsaArtillery = false;
  filterByCsaArtillery = false;

  showArtyDiv = false;
  showArtyDesktop = true;

  showAttackerDiv: boolean = false;
  showAttackerDesktop = true;

  showFavoritesDiv: boolean = false;
  showFavoritesDesktop = true;

  filterByFavorites = false;
  selectedFavorite: string | undefined;
  currentFavorites: any[] = [];
  showFavoritesOnly: boolean = false;
  showFavoritesOnlyDesktop = true;

  constructor(
    private mapService: MapService,
    private token: TokenStorageService,
    private favoriteService: FavoriteService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    await this.retrieveFilterState();

    await this.getMaps();
    await this.getFavorites();
    await this.filterMaps();
    
  }

  /**
   * Retrieve filter state
   * This function is used to retrieve the filter state from local storage
   */
  async retrieveFilterState(): Promise<void> {
    const savedFilterState = localStorage.getItem("filterState");
    if (savedFilterState) {
      const filterState = JSON.parse(savedFilterState);
      this.selectedCampaigns = filterState.selectedCampaigns;
      this.selectedAttacker = filterState.selectedAttacker;
      this.filterByUsaArtillery = filterState.filterByUsaArtillery;
      this.filterByCsaArtillery = filterState.filterByCsaArtillery;
      this.searchText = filterState.searchText;
      this.filterByCampaign = filterState.filterByCampaign;
      this.filterByFavorites = filterState.filterByFavorites;
      this.selectedFavorite = filterState.selectedFavorite;
      this.showFavoritesOnly = filterState.showFavoritesOnly;

      await this.filterMaps();
    }
  }

  /**
   * Save filter state
   * This function is used to save the filter state to local storage
   */
  async saveFilterState(): Promise<void> {
    const filterState = {
      selectedCampaigns: this.selectedCampaigns,
      selectedAttacker: this.selectedAttacker,
      filterByUsaArtillery: this.filterByUsaArtillery,
      filterByCsaArtillery: this.filterByCsaArtillery,
      searchText: this.searchText,
      filterByCampaign: this.filterByCampaign,
      filterByFavorites: this.filterByFavorites,
      showFavoritesOnly: this.showFavoritesOnly,
    };
    localStorage.setItem("filterState", JSON.stringify(filterState));
  }

  /**
   * Clear search text
   * This function is used to clear the search text
   */
  clearSearchText() {
    this.searchText = "";
    this.filterMaps();
  }

  /**
   * Set active map
   * This function is used to set the active map
   * @param map - map
   * @param index - index
   */
  setActiveMap(map: Map, index: number): void {
    this.currentMap = map;
    this.currentIndex = index;
    this.showMapPage = true;
  }

  /**
   * Get maps
   * This function is used to get all maps
   */
  async getMaps(): Promise<void> {
    this.mapService.getAll().subscribe({
      next: async (data) => {
        this.map = data;
        this.originalMap = data;
        this.uniqueCampaigns = await this.getUniqueCampaigns(data);

        this.loading = false;
      },
      error: (e) => console.error(e),
    });
  }

  /**
   * Get unique campaigns
   * This function is used to get all unique campaigns
   * @param data - data
   * @returns - unique campaigns
   */
  private async getUniqueCampaigns(data: Map[]): Promise<string[]> {
    const excludedCampaigns = ["Picket Patrol", "Drill Camp"];
    const campaigns = data
      .map((map) => map.campaign)
      .filter((campaign) => !excludedCampaigns.includes(campaign));
    return [...new Set(campaigns)];
  }

  /**
   * Toggle favorite
   * This function is used to filter map data by a user's favorites
   */
  async filterMaps(): Promise<void> {
    let filteredMap: Map[] = this.originalMap || [];

    if (this.showFavoritesOnly) {
      filteredMap = filteredMap.filter((map) =>
        this.currentFavorites.some((favorite) => favorite.mapId === map.id)
      );
    }

    if (this.selectedAttacker === "USA") {
      filteredMap = filteredMap.filter((map) => map.attacker === "USA");
    }

    if (this.selectedAttacker === "CSA") {
      filteredMap = filteredMap.filter((map) => map.attacker === "CSA");
    }

    if (this.selectedAttacker === "No") {
      filteredMap = filteredMap.filter((map) => map.attacker === "No");
    }

    if (this.filterByUsaArtillery) {
      filteredMap = filteredMap.filter((map) => map.usaArty);
    }

    if (this.filterByCsaArtillery) {
      filteredMap = filteredMap.filter((map) => map.csaArty);
    }

    if (this.selectedCampaigns.length > 0) {
      filteredMap = filteredMap.filter((map) =>
        this.selectedCampaigns.includes(map.campaign)
      );
    }

    if (this.searchText) {
      filteredMap = filteredMap.filter((map) =>
        map.map?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.map = filteredMap;

    await this.saveFilterState();
  }

  /**
   * Get favorites
   * This function is used to get all favorites for a user
   * @returns - favorites
   */
  private async getFavorites(): Promise<void> {
    const userID = this.currentUser.id;

    if (userID === undefined) return;

    this.favoriteService.getByUserId(userID).subscribe(
      (response) => {
        this.currentFavorites = response;
        this.filterMaps();
      },
      (error) => {
        console.error("Error:", error);
      }
    );
  }

  /**
   * This function is used to toggle the campaign filter
   * @param campaign - campaign 
   */
  toggleCampaignSelection(campaign: string): void {
    const index = this.selectedCampaigns.indexOf(campaign);

    if (index > -1) {
      this.selectedCampaigns.splice(index, 1);
    } else {
      this.selectedCampaigns.push(campaign);
    }

    this.selectedCampaign =
      this.selectedCampaigns.length > 0 ? this.selectedCampaigns[0] : "";
    this.filterMaps();
  }

  /**
   * Set selected campaign
   * This function is used to set the selected campaign
   * @param campaign 
   */
  setSelectedCampaign(campaign: string): void {
    this.selectedCampaigns = [campaign];
    this.selectedCampaign = campaign;
    this.filterMaps();
  }

  /**
   * Toggle filter by campaign
   * This function is used to toggle the filter by campaign
   */
  toggleFilterByCampaign(): void {
    this.filterByCampaignDiv = !this.filterByCampaignDiv;
  }

  /**
   * Toggle filter by campaign
   * This function is used to toggle the filter by campaign
   */
  toggleFilterCampaign(): void {
    this.filterByCampaign = !this.filterByCampaign;
  }

  /**
   * Toggle filter by favorites
   * This function is used to toggle the filter by favorites
   */
  toggleFavoritesOnly(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.filterMaps();
  }

  /**
   * Toggle filter by favorites desktop element
   */
  toggleFavoritesOnlyDesktop(): void {
    this.showFavoritesOnlyDesktop = !this.showFavoritesOnlyDesktop;
    this.filterMaps();
  }

  /**
   * Toggle filter by favorites
   */
  toggleFavoritesDiv(): void {
    this.showFavoritesDiv = !this.showFavoritesDiv;
  }
  toggleFavorites(): void {
    this.showFavoritesDesktop = !this.showFavoritesDesktop;
  }

  /**
   * Toggle filter by attackers
   */
  toggleAttackerDiv() {
    this.showAttackerDiv = !this.showAttackerDiv;
  }
  toggleAttacker() {
    this.showAttackerDesktop = !this.showAttackerDesktop;
  }

  /**
   * Toggle filter by artillery
   */
  toggleFilterByArtillery(): void {
    this.filterByArtillery = !this.filterByArtillery;
  }
  toggleArty(): void {
    this.showArtyDesktop = !this.showArtyDesktop;
  }
  toggleArtyDiv(): void {
    this.showArtyDiv = !this.showArtyDiv;
  }

  /**
   * Check selected campaign
   * This function is used to check if a campaign is selected
   * @param campaign - campaign
   * @returns - boolean
   */
  isCampaignSelected(campaign: string): boolean {
    return this.selectedCampaigns.includes(campaign);
  }

  /**
   * Clear all search filters
   * This function is used to clear all search filters
   */
  clearFilters(): void {
    this.searchText = "";
    this.selectedCampaign = "";
    this.selectedCampaigns = [];
    this.filterByCampaign = true;

    this.filterByAttacker = false;
    this.filterByCsaAttacker = false;
    this.filterByUsaAttacker = false;
    this.selectedAttacker = undefined;

    this.filterByArtillery = false;
    this.filterByUsaArtillery = false;
    this.filterByCsaArtillery = false;

    this.showArtyDiv = false;
    this.showAttackerDiv = false;

    this.selectedFavorite = undefined;
    this.showFavoritesOnly = false;

    this.filterMaps();
    this.getFavorites();
  }

  /**
   * Scroll to top
   * This function is used to scroll to the top of the page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}
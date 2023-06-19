import { Component, OnInit } from "@angular/core";
import { MapService } from "../_services/map.service";
import { TokenStorageService } from "../_services/token-storage.service";
import { FavoriteService } from "../_services/favorite.service";
import { Map } from "../_models/map.model";

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

  ngOnInit(): void {
    this.loading = true;
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    this.retrieveFilterState();

    this.getMaps();
    this.getFavorites();

    setTimeout(() => {
      this.loading = false;
      this.filterMaps();
    }, 120);
  }

  retrieveFilterState(): void {
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

      this.filterMaps();
    }
  }

  saveFilterState(): void {
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

  clearSearchText() {
    this.searchText = "";
    this.filterMaps();
  }

  setActiveMap(map: Map, index: number): void {
    this.currentMap = map;
    this.currentIndex = index;
    this.showMapPage = true;
  }

  getMaps(): void {
    this.mapService.getAll().subscribe({
      next: (data) => {
        this.map = data;
        this.originalMap = data;
        this.uniqueCampaigns = this.getUniqueCampaigns(data);
      },
      error: (e) => console.error(e),
    });
  }

  private getUniqueCampaigns(data: Map[]): string[] {
    const excludedCampaigns = ["Picket Patrol", "Drill Camp"];
    const campaigns = data
      .map((map) => map.campaign)
      .filter((campaign) => !excludedCampaigns.includes(campaign));
    return [...new Set(campaigns)];
  }

  filterMaps(): void {
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

    this.saveFilterState();
  }

  private getFavorites(): void {
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

  setSelectedCampaign(campaign: string): void {
    this.selectedCampaigns = [campaign];
    this.selectedCampaign = campaign;
    this.filterMaps();
  }

  toggleFilterByCampaign(): void {
    this.filterByCampaignDiv = !this.filterByCampaignDiv;
  }

  toggleFilterCampaign(): void {
    this.filterByCampaign = !this.filterByCampaign;
  }

  toggleFavoritesOnly(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.filterMaps();
  }

  toggleFavoritesOnlyDesktop(): void {
    this.showFavoritesOnlyDesktop = !this.showFavoritesOnlyDesktop;
    this.filterMaps();
  }

  toggleFavoritesDiv(): void {
    this.showFavoritesDiv = !this.showFavoritesDiv;
  }

  toggleFavorites(): void {
    this.showFavoritesDesktop = !this.showFavoritesDesktop;
  }

  toggleAttackerDiv() {
    this.showAttackerDiv = !this.showAttackerDiv;
  }

  toggleAttacker() {
    this.showAttackerDesktop = !this.showAttackerDesktop;
  }

  toggleFilterByArtillery(): void {
    this.filterByArtillery = !this.filterByArtillery;
  }

  toggleArty(): void {
    this.showArtyDesktop = !this.showArtyDesktop;
  }
  toggleArtyDiv(): void {
    this.showArtyDiv = !this.showArtyDiv;
  }

  isCampaignSelected(campaign: string): boolean {
    return this.selectedCampaigns.includes(campaign);
  }

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

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}

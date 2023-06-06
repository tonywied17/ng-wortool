import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { MapService } from "../_services/map.service";
import { TokenStorageService } from "../_services/token-storage.service";
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
  showAttackerDiv: boolean = false;

  constructor(
    private mapService: MapService,
    private token: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    this.retrieveFilterState(); // Retrieve filter state from local storage

    this.getMaps();

    setTimeout(() => {
      this.loading = false;
      this.filterMaps();
    }, 300);
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
    };
    localStorage.setItem("filterState", JSON.stringify(filterState));
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
    const campaigns = data.map((map) => map.campaign);
    return [...new Set(campaigns)];
  }

  filterMaps(): void {
    let filteredMap: Map[] = this.originalMap || [];

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

    if (this.filterByCampaign && this.selectedCampaigns.length > 0) {
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

  toggleCampaignSelection(campaign: string): void {
    const index = this.selectedCampaigns.indexOf(campaign);

    if (index > -1) {
      this.selectedCampaigns.splice(index, 1);
    } else {
      this.selectedCampaigns.push(campaign);
    }

    this.filterMaps();
  }

  setSelectedCampaign(campaign: string): void {
    const index = this.selectedCampaigns.indexOf(campaign);

    if (index > -1) {
      this.selectedCampaigns.splice(index, 1);
    } else {
      this.selectedCampaigns.push(campaign);
    }

    this.filterMaps();
  }

  toggleFilterByCampaign(): void {
    this.filterByCampaignDiv = !this.filterByCampaignDiv;
  }

  toggleAttackerDiv() {
    this.showAttackerDiv = !this.showAttackerDiv;
  }

  toggleFilterByArtillery(): void {
    this.filterByArtillery = !this.filterByArtillery;
  }

  toggleArtyDiv(): void {
    this.showArtyDiv = !this.showArtyDiv;
  }

  isCampaignSelected(campaign: string): boolean {
    return this.selectedCampaigns.includes(campaign);
  }

  clearFilters(): void {
    // Clear search text
    this.searchText = "";

    // Clear campaign checkboxes
    this.selectedCampaigns = [];

    // Clear USA/CSA artillery checkboxes
    this.filterByUsaArtillery = false;
    this.filterByCsaArtillery = false;

    // Clear attacker radio buttons
    this.selectedAttacker = "";

    // Filter the maps based on the cleared filters
    this.filterMaps();
  }

  scrollToTop(): void {
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}

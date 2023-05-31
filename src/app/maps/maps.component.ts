import { Component, OnInit, Input } from '@angular/core';
import { MapService } from '../_services/map.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { Map } from '../_models/map.model';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  map?: Map[];
  currentMap: Map = {};
  currentIndex = -1
  showMapPage = false;
  loading = true;
  currentUser: any;
  isLoggedIn = false;
  originalMap?: Map[];
  searchText: string = '';
  selectedCampaign: string = '';
  selectedCampaigns: string[] = [];
  uniqueCampaigns: string[] = [];
  filterByCampaign = false;

  constructor(private mapService: MapService, private token: TokenStorageService,) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    this.getMaps();

    this.updateFilterByCampaign(); // Update filterByCampaign on component initialization

    // Listen for window resize event
    window.addEventListener('resize', () => {
      this.updateFilterByCampaign();
    });
    
  }

  updateFilterByCampaign(): void {
    if (this.isMobileView()) {
      this.filterByCampaign = false; // Disable "Filter by Campaign" checkbox in mobile view
    } else {
      this.filterByCampaign = true; // Enable "Filter by Campaign" checkbox in desktop view
    }
  }

  isMobileView(): boolean {
    return window.innerWidth <= 1024; // Adjust the breakpoint according to your needs
  }

  setActiveMap(map: Map, index: number): void {
    this.currentMap = map;
    this.currentIndex = index;
    this.showMapPage = true
  }

  getMaps(): void {
    this.mapService.getAll().subscribe({
      next: (data) => {
        this.map = data;
        this.originalMap = data;
        this.uniqueCampaigns = this.getUniqueCampaigns(data);
      },
      error: (e) => console.error(e)
    });
  }

  private getUniqueCampaigns(data: Map[]): string[] {
    const campaigns = data.map((map) => map.campaign);
    return [...new Set(campaigns)];
  }


  filterMaps(): void {
    let filteredMap: Map[] = this.originalMap || [];

    if (this.filterByCampaign && this.selectedCampaigns.length > 0) {
      filteredMap = filteredMap.filter((map) => this.selectedCampaigns.includes(map.campaign));
    }

    if (this.searchText) {
      filteredMap = filteredMap.filter((map) =>
        map.map?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (!this.searchText && !this.filterByCampaign) {
      this.selectedCampaigns = [];
      this.selectedCampaign = '';
    }

    this.map = filteredMap;
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
    this.filterByCampaign = !this.filterByCampaign;
  }
  
  
  isCampaignSelected(campaign: string): boolean {
    return this.selectedCampaigns.includes(campaign);
  }
  scrollToTop(): void {
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}

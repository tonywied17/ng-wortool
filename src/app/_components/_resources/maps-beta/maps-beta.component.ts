import { Component, HostListener, type OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { FavoriteService } from "src/app/_services/favorite.service";
import { WeaponService } from "src/app/_services/weapon.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { trigger, state, style, transition, animate } from '@angular/animations';
interface CollapseState {
  [key: string]: boolean;
}

@Component({
  selector: "app-maps-beta",
  templateUrl: "./maps-beta.component.html",
  styleUrls: ["./maps-beta.component.scss"],
  animations: [
    trigger('cardAnimation', [
      state('default', style({
        transform: 'scale(1)',
        opacity: '0.8',
      })),
      state('hover', style({
        transform: 'scale(1.04)',
        opacity: '1',
      })),
      transition('default <=> hover', animate('300ms ease-in-out'))
    ])
  ]
})
export class MapsBetaComponent implements OnInit {
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  isLoaded: boolean = false;
  isDesktop: boolean = true;

  weapons: any[] = [];
  maps: any[] = [];
  userFavorites: any[] = [];
  uniqueCampaigns: string[] = [];
  selectedCampaigns: { [key: string]: boolean } = {};
  searchText: string = '';
  csaArtillery: boolean = false;
  usaArtillery: boolean = false;
  filterFavorites: boolean = false;
  weaponsGroupedByType: { [key: string]: any[] } = {};
  selectedWeapons: any = {};
  filteredMaps: any[] = [];
  selectedAttacker: string = '';

  selectedInfantryUnits: { [key: string]: boolean } = {};
  selectedArtilleryUnits: { [key: string]: boolean } = {};

  isCollapsed: CollapseState = {
    attacker: false,
    artillery: false,
    campaign: false,
    weaponry: true,
    infantryUnits: true,
    artilleryUnits: true,
  };

  constructor(
    private mapService: MapService,
    private weaponService: WeaponService,
    public sharedDataService: SharedDataService,
    public favoriteService: FavoriteService,
  ) { this.adjustForWindowSize(window.innerWidth) }

  async ngOnInit(): Promise<void> {
    try {
      
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([this.retrieveMaps(), this.retrieveWeapons()]);
      this.isLoaded = true;
      this.restoreFilterState();
      console.log("All data is loaded:", this.isLoaded);
      console.log("Maps:", this.maps);
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  toggleCollapse(section: string): void {
    this.isCollapsed[section] = !this.isCollapsed[section];
    this.saveFilterState();
  }

  async retrieveMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mapService.getAllMapsVerbose().subscribe({
        next: (data) => {
          this.maps = data;
          this.filteredMaps = this.maps;

          this.uniqueCampaigns = [...new Set(this.maps.map(map => map.campaign))];
          this.uniqueCampaigns.forEach(campaign => {
            this.selectedCampaigns[campaign] = false;
          });
          this.populateUnitNames();
          this.sortMaps();
          resolve();
        },
        error: (error) => {
          console.error("Error retrieving maps:", error);
          reject(error);
        }
      });
    });
  }

  uniqueInfantryUnits: string[] = [];
  uniqueArtilleryUnits: string[] = [];

  populateUnitNames(): void {
    let infantryUnits = new Set<string>();
    let artilleryUnits = new Set<string>();

    this.maps.forEach(map => {
      map.usa_regiments?.Infantry?.forEach((unit: { name: string; }) => infantryUnits.add(unit.name));
      map.csa_regiments?.Infantry?.forEach((unit: { name: string; }) => infantryUnits.add(unit.name));
      map.usa_regiments?.Artillery?.forEach((unit: { name: string; }) => artilleryUnits.add(unit.name));
      map.csa_regiments?.Artillery?.forEach((unit: { name: string; }) => artilleryUnits.add(unit.name));
    });

    this.uniqueInfantryUnits = Array.from(infantryUnits);
    this.uniqueArtilleryUnits = Array.from(artilleryUnits);
  }

  async retrieveWeapons(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.weaponService.getAll().subscribe({
        next: (data: any) => {
          this.weapons = JSON.parse(data);
          this.groupWeaponsByType();
          resolve();
        },
        error: (error: any) => {
          console.error("Error retrieving weapons:", error);
          reject(error);
        }
      });
    });
  }

  groupWeaponsByType(): void {
    const grouped = this.weapons.reduce((acc, weapon) => {
      if (!acc[weapon.type]) {
        acc[weapon.type] = [];
      }
      acc[weapon.type].push(weapon);
      return acc;
    }, {});

    this.weaponsGroupedByType = grouped;
  }

  isFavorite(map: any): boolean {
    return map.map_favorites.some((fav: { id: Number; }) => fav.id === this.sharedDataService.currentUser.id);
  }

  toggleFavorite(map: any): void {
    const currentRoute = `/maps-beta/${map.id}`;
    const isFav = this.isFavorite(map);

    if (isFav) {
      this.favoriteService.delete(map.id, this.sharedDataService.currentUser.id).subscribe((data) => {
        console.log("Removed favorite map:", data);
        if (map.map_favorite_count > 0) {
          map.map_favorite_count -= 1;
        }
        this.updateMapFavoriteStatus(map, false);
      });
    } else {
      this.favoriteService.createOrUpdate(currentRoute, map.id, this.sharedDataService.currentUser.id, "map").subscribe((data) => {
        console.log("Added favorite map:", data);
        map.map_favorite_count += 1;
        this.updateMapFavoriteStatus(map, true);
      });
    }
  }

  updateMapFavoriteStatus(map: any, isFavorite: boolean): void {
    const mapIndex = this.maps.findIndex(m => m.id === map.id);
    if (mapIndex !== -1) {
      if (isFavorite) {
        map.map_favorites.push({ id: this.sharedDataService.currentUser.id });
      } else {
        map.map_favorites = map.map_favorites.filter((fav: { id: Number; }) => fav.id !== this.sharedDataService.currentUser.id);
      }
    }
  }

  filterMaps(): void {
    this.filteredMaps = this.maps.filter(map => {
      const matchesSearchText = this.searchText === '' || map.name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCSAArtillery = !this.csaArtillery || map.csa_artillery === this.csaArtillery;
      const matchesUSAArtillery = !this.usaArtillery || map.usa_artillery === this.usaArtillery;
      const matchesFavorites = !this.filterFavorites || this.isFavorite(map);
      const anyCampaignSelected = Object.values(this.selectedCampaigns).some(value => value);
      const matchesCampaign = !anyCampaignSelected || Object.keys(this.selectedCampaigns).some(campaign => this.selectedCampaigns[campaign] && map.campaign.includes(campaign));

      const anyInfantrySelected = Object.values(this.selectedInfantryUnits).some(value => value);
      const anyArtillerySelected = Object.values(this.selectedArtilleryUnits).some(value => value);

      const matchesInfantry = !anyInfantrySelected || this.matchesUnit(map, 'Infantry', this.selectedInfantryUnits);
      const matchesArtillery = !anyArtillerySelected || this.matchesUnit(map, 'Artillery', this.selectedArtilleryUnits);

      const shouldShowMapBasedOnUnits = (anyInfantrySelected && matchesInfantry) || (anyArtillerySelected && matchesArtillery) || (!anyInfantrySelected && !anyArtillerySelected);

      const matchesAttacker = !this.selectedAttacker || map.attacker === this.selectedAttacker;

      const matchesWeapons = this.filterBySelectedWeapons(map);

      this.saveFilterState();

      return shouldShowMapBasedOnUnits && matchesSearchText && matchesCSAArtillery && matchesUSAArtillery && matchesFavorites && matchesCampaign && matchesAttacker && matchesWeapons;
    });
  }

  private matchesUnit(map: any, unitType: 'Infantry' | 'Artillery', selectedUnits: { [key: string]: boolean }): boolean {
    const usaUnits = map.usa_regiments?.[unitType]?.map((unit: { name: any; }) => unit.name) || [];
    const csaUnits = map.csa_regiments?.[unitType]?.map((unit: { name: any; }) => unit.name) || [];
    const allUnits = [...usaUnits, ...csaUnits];
    return Object.keys(selectedUnits).some(unitName => selectedUnits[unitName] && allUnits.includes(unitName));
  }


  private filterBySelectedWeapons(map: any): boolean {
    const selectedWeaponNames = Object.keys(this.selectedWeapons).filter(key => this.selectedWeapons[key]);

    if (selectedWeaponNames.length === 0) {
      return true;
    }

    const allRegiments = [
      ...(map.usa_regiments?.Infantry || []),
      ...(map.csa_regiments?.Infantry || []),
      ...(map.usa_regiments?.Artillery || []),
      ...(map.csa_regiments?.Artillery || [])
    ];

    return selectedWeaponNames.some(weaponName =>
      allRegiments.some(regiment =>
        regiment.regiment_weaponry.some((weapon: { weapon_info: { weapon: string; }; }) =>
          weapon.weapon_info.weapon === weaponName
        )
      )
    );
  }


  sortDirection: 'ascending' | 'descending' = 'descending';
  sortBy: 'favorites' | 'name' = 'favorites';
  sortMaps(): void {
    if (this.sortBy === 'favorites') {
      this.filteredMaps.sort((a, b) => {
        const diff = a.map_favorite_count - b.map_favorite_count;
        return this.sortDirection === 'ascending' ? diff : -diff;
      });
    } else if (this.sortBy === 'name') {
      this.filteredMaps.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return this.sortDirection === 'ascending' ? -1 : 1;
        }
        if (nameA > nameB) {
          return this.sortDirection === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
  }

  clearSearchText() {
    this.searchText = "";
    this.filterMaps();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'ascending' ? 'descending' : 'ascending';
  }

  getBuckNBallSides(map: any): string {
    const weaponId = '6';
    const weaponName = 'Springfield M1842';

    let sidesWithWeapon: string[] = [];

    const usaInfantry = map.usa_regiments?.Infantry || [];
    const csaInfantry = map.csa_regiments?.Infantry || [];

    const usaHasWeapon = usaInfantry.some((regiment: { regiment_weaponry: any[]; }) => regiment.regiment_weaponry.some((weapon: { weapon_info: { id: { toString: () => string; }; weapon: string; }; }) => weapon.weapon_info.id.toString() === weaponId || weapon.weapon_info.weapon === weaponName));
    if (usaHasWeapon) sidesWithWeapon.push('USA');

    const csaHasWeapon = csaInfantry.some((regiment: { regiment_weaponry: any[]; }) => regiment.regiment_weaponry.some((weapon: { weapon_info: { id: { toString: () => string; }; weapon: string; }; }) => weapon.weapon_info.id.toString() === weaponId || weapon.weapon_info.weapon === weaponName));
    if (csaHasWeapon) sidesWithWeapon.push('CSA');

    return sidesWithWeapon.join(' & ');
  }

  saveFilterState(): void {
    const filterState = {
      selectedCampaigns: this.selectedCampaigns,
      selectedInfantryUnits: this.selectedInfantryUnits,
      selectedArtilleryUnits: this.selectedArtilleryUnits,
      searchText: this.searchText,
      csaArtillery: this.csaArtillery,
      usaArtillery: this.usaArtillery,
      filterFavorites: this.filterFavorites,
      selectedAttacker: this.selectedAttacker,
      selectedWeapons: this.selectedWeapons,
      isCollapsed: this.isCollapsed,
    };
    localStorage.setItem('mapSideBarStates', JSON.stringify(filterState));
  }

  restoreFilterState(): void {
    const savedState = localStorage.getItem('mapSideBarStates');
    if (savedState) {
      const filterState = JSON.parse(savedState);
      this.selectedCampaigns = filterState.selectedCampaigns || this.selectedCampaigns;
      this.selectedInfantryUnits = filterState.selectedInfantryUnits || this.selectedInfantryUnits;
      this.selectedArtilleryUnits = filterState.selectedArtilleryUnits || this.selectedArtilleryUnits;
      this.searchText = filterState.searchText || '';
      this.csaArtillery = filterState.csaArtillery || false;
      this.usaArtillery = filterState.usaArtillery || false;
      this.filterFavorites = filterState.filterFavorites || false;
      this.selectedAttacker = filterState.selectedAttacker || '';
      this.selectedWeapons = filterState.selectedWeapons || this.selectedWeapons;
      this.isCollapsed = filterState.isCollapsed || this.isCollapsed;
      this.filterMaps();
    }
  }


  clearAllFilters(): void {
    Object.keys(this.selectedCampaigns).forEach(campaign => {
      this.selectedCampaigns[campaign] = false;
    });
  
    Object.keys(this.selectedInfantryUnits).forEach(unit => {
      this.selectedInfantryUnits[unit] = false;
    });
    Object.keys(this.selectedArtilleryUnits).forEach(unit => {
      this.selectedArtilleryUnits[unit] = false;
    });
  
    Object.keys(this.selectedWeapons).forEach(weapon => {
      this.selectedWeapons[weapon] = false;
    });
  
    this.searchText = '';
    this.csaArtillery = false;
    this.usaArtillery = false;
    this.filterFavorites = false;
    this.selectedAttacker = '';
  
    this.filterMaps();
  }

  clearFilters(filter: string): void {

    switch (filter) {
      case 'campaign':
        Object.keys(this.selectedCampaigns).forEach(campaign => {
          this.selectedCampaigns[campaign] = false;
        });
        break;
      case 'infantryUnits':
        Object.keys(this.selectedInfantryUnits).forEach(unit => {
          this.selectedInfantryUnits[unit] = false;
        });
        break;
      case 'artilleryUnits':
        Object.keys(this.selectedArtilleryUnits).forEach(unit => {
          this.selectedArtilleryUnits[unit] = false;
        });
        break;
      case 'weaponry':
        Object.keys(this.selectedWeapons).forEach(weapon => {
          this.selectedWeapons[weapon] = false;
        });
        break;
      default:
        break;
    }
    this.filterMaps();

  }
  

  // Custom animation for map cards and other resize events
  animationStates: { [index: number]: string } = {};
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkDeviceType();
    this.adjustForWindowSize(event.target.innerWidth);
  }
  checkDeviceType() {
    this.isDesktop = window.innerWidth > 768;
  }
  onMouseEnter(i: number) {
    if (this.isDesktop) {
      this.animationStates[i] = 'hover';
    }
  }

  onMouseLeave(i: number) {
    if (this.isDesktop) {
      this.animationStates[i] = 'default';
    }
  }

  adjustForWindowSize(width: number) {
    this.checkDeviceType();
    if (!this.isDesktop) {
      Object.keys(this.isCollapsed).forEach(key => {
        this.isCollapsed[key] = true;
      });
    } else {
      this.restoreFilterState();
    }
  }
}

import { Component, HostListener, type OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { FavoriteService } from "src/app/_services/favorite.service";
import { WeaponService } from "src/app/_services/weapon.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  objectKeys = Object.keys;

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
  
  constructor(
    private mapService: MapService,
    private weaponService: WeaponService,
    private tokenStorageService: TokenStorageService,
    public sharedDataService: SharedDataService,
    public favoriteService: FavoriteService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([this.retrieveMaps(), this.retrieveWeapons()]);
      this.isLoaded = true;
      console.log("All data is loaded:", this.isLoaded);
      console.log("Maps:", this.maps);
    } catch (error) {
      console.error("Error during initialization:", error);
    }
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
        map.map_favorites.push({id: this.sharedDataService.currentUser.id});
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
        const matchesCampaign = this.uniqueCampaigns.every(campaign => !this.selectedCampaigns[campaign] || map.campaign.includes(campaign));
        const selectedWeaponNames = Object.keys(this.selectedWeapons).filter(key => this.selectedWeapons[key]);
        const matchesWeapons = selectedWeaponNames.length === 0 || selectedWeaponNames.some(weaponName => {
            const allRegiments = [...(map.usa_regiments?.Infantry || []), ...(map.csa_regiments?.Infantry || [])];
            return allRegiments.some(regiment => {
                return regiment.regiment_weaponry.some((weapon: { weapon_info: { weapon: string; }; }) => weapon.weapon_info.weapon === weaponName);
            });
        });

        return matchesSearchText && matchesCSAArtillery && matchesUSAArtillery && matchesFavorites && matchesCampaign && matchesWeapons;
    });
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
  
  
  
// Custom animation for map cards
  animationStates: {[index: number]: string} = {};
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkDeviceType();
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
}

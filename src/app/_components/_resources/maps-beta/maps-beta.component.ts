import { Component, HostListener, type OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { FavoriteService } from "src/app/_services/favorite.service";
import { WeaponService } from "src/app/_services/weapon.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from "@angular/router";

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

  isLoaded: boolean = false;
  isDesktop: boolean = true;

  maps: any[] = [];
  userFavorites: any[] = [];
  
  constructor(
    private mapService: MapService,
    private weaponService: WeaponService,
    private tokenStorageService: TokenStorageService,
    public sharedDataService: SharedDataService,
    public favoriteService: FavoriteService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.sharedDataService
      .retrieveInitialData()
      .then(async () => {
        await this.retrieveMaps();
        this.isLoaded = true;
        console.log(this.isLoaded)
      })
      .catch((error) => {
        console.error("Error initializing shared data:", error);
      });
  }

  async retrieveMaps(): Promise<void> {
    this.mapService.getAllMapsVerbose().subscribe((data) => {
        this.maps = data;
        console.log("Retrieved maps:", this.maps);
    });
  }

  isFavorite(map: any): boolean {
    return map.map_favorites.some((fav: { id: Number; }) => fav.id === this.sharedDataService.currentUser.id);
  }


  toggleFavorite(map: any): void {
    const currentRoute = this.router.url;
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

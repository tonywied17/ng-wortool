import { ChangeDetectorRef, Component, HostListener, TemplateRef, ViewChild, type OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from "src/app/_services/map.service";
import { NoteService } from "src/app/_services/note.service";
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SharedDataService } from 'src/app/_services/shared-data.service';
import { WeaponService } from "src/app/_services/weapon.service";
import {FavoriteService} from "src/app/_services/favorite.service";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { TemplatePortal } from "@angular/cdk/portal";
import { MapImageModalComponent } from "../../maps/map-image-modal/map-image-modal.component";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-map-beta-details',
  templateUrl: './map-beta-details.component.html',
  styleUrl: './map-beta-details.component.scss'
})

export class MapBetaDetailsComponent implements OnInit {


  constructor(private mapService: MapService,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private router: Router,
    private token: TokenStorageService,
    public sharedDataService: SharedDataService,
    private weaponService: WeaponService,
    public favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
    ) { }

    @ViewChild("dialogTemplate")
    _dialogTemplate!: TemplateRef<any>;
    private _overlayRef!: OverlayRef;
    private _portal!: TemplatePortal;

    pageRoute = this.route.snapshot.paramMap.get('id');
    weapons: any[] = [];
    map: any;
    weaponsGroupedByType: { [key: string]: any[] } = {};
    selectedWeapons: any = {};
    isLoaded: boolean = false;


    async ngOnInit(): Promise<void> {
       try {
          await this.sharedDataService.retrieveInitialData();
          await Promise.all([this.retrieveMaps(), this.retrieveWeapons()]);
          this.isLoaded = true;
          console.log("All data is loaded:", this.isLoaded);
          console.log("Maps:", this.map);
        } catch (error) {
          console.error("Error during initialization:", error);
        }
    }

    async retrieveMaps(): Promise<void> {
      return new Promise((resolve, reject) => {
        this.mapService.getMap(this.pageRoute).subscribe({
          next: (data) => {
            this.map = data;
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
      const mapIndex = this.map.findIndex((m: { id: any; }) => m.id === map.id);
      if (mapIndex !== -1) {
        if (isFavorite) {
          map.map_favorites.push({id: this.sharedDataService.currentUser.id});
        } else {
          map.map_favorites = map.map_favorites.filter((fav: { id: Number; }) => fav.id !== this.sharedDataService.currentUser.id);
        }
      }
    }
    
    CamMapBool: boolean = false;
    CamMap: string = "Disabled";

    toggle(event: MatSlideToggleChange) {
      if (event.checked) {
        this.CamMap = "Enabled";
        this.CamMapBool = true;

        this.cdr.detectChanges();
  
        const videoContainer = document.getElementById("videoContainer");
        if (videoContainer) {
          const youtubeUrl = this.map.youtube_embed;
          const iframeHtml = `<iframe class="h-[100%]" width="100%" src="${youtubeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 0.375rem;border-top-left-radius: 0;"></iframe>`;
          videoContainer.innerHTML = iframeHtml;
        }
      } else {
        this.CamMap = "Disabled";
        this.CamMapBool = false;
      }
    }


    openImageModal(imageUrl: string): void {
      this.dialog.open(MapImageModalComponent, {
        data: { imageUrl },
      });
    }
  
      /**
     * on after view init
     */
      ngAfterViewInit() {
        this._portal = new TemplatePortal(
          this._dialogTemplate,
          this._viewContainerRef
        );
        this._overlayRef = this._overlay.create({
          positionStrategy: this._overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically(),
          hasBackdrop: true,
        });
        this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
      }
    
      /**
       * on destroy
       */
      ngOnDestroy() {
        this._overlayRef.dispose();
      }
    
      /**
       * open dialog
       * This is a function that opens a dialog
       */
      openDialog() {
        this._overlayRef.attach(this._portal);
      }
    
      /**
       * close popup
       */
      closePopup() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
          this._overlayRef.detach();
        }
      }
  
}

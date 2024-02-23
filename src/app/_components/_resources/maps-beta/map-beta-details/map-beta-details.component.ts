import { ChangeDetectorRef, Component, HostListener, TemplateRef, ViewChild, type OnInit, ViewContainerRef } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from "src/app/_services/map.service";
import { NoteService } from "src/app/_services/note.service";
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SharedDataService } from 'src/app/_services/shared-data.service';
import { WeaponService } from "src/app/_services/weapon.service";
import { FavoriteService } from "src/app/_services/favorite.service";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { TemplatePortal } from "@angular/cdk/portal";
import { MapImageModalComponent } from "../../maps-beta/map-image-modal/map-image-modal.component";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { Clipboard } from "@angular/cdk/clipboard";
import { Note } from "src/app/_models/note.model";



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
    private _viewContainerRef: ViewContainerRef,
    private _snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private location: Location,
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
    currentNotes: any;

    goBack(): void {
      this.location.back();
    }

    async ngOnInit(): Promise<void> {
      try {
        await this.sharedDataService.retrieveInitialData();
        await Promise.all([this.retrieveMaps(), this.retrieveWeapons()]);
        console.log(this.sharedDataService.isLoggedIn)
        if (this.sharedDataService.isLoggedIn) {
          console.log(this.sharedDataService)
          await this.getCurrentNotes();
        }
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
            this.setRegimentData(data);
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

    openSnackBar(message: string, duration: number) {
      const config = new MatSnackBarConfig();
      config.duration = duration;
      config.horizontalPosition = "center";
      config.verticalPosition = "top";
  
      this._snackBar.open(message, "Okay", config);
    }

    isFavorite(map: any): boolean {
      const favorites = map?.map_favorites ?? [];
      return favorites.some((fav: { id: number; }) => fav.id === this.sharedDataService.currentUser.id);
    }
     
    toggleFavorite(map: any): void {
      const currentRoute = `/maps/${map.id}`;
      const isFav = this.isFavorite(map);
      
      if (isFav) {
        this.favoriteService.delete(map.id, this.sharedDataService.currentUser.id).subscribe((data) => {
          console.log("Removed favorite map:", data);
          if (map.map_favorite_count > 0) {
            map.map_favorite_count -= 1;
          }
          this.updateMapFavoriteStatus(map, false);
          this._snackBar.open(map.name + " removed from favorites.", "Okay", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        });
      } else {
        this.favoriteService.createOrUpdate(currentRoute, map.id, this.sharedDataService.currentUser.id, "map").subscribe((data) => {
          console.log("Added favorite map:", data);
          map.map_favorite_count += 1;
          this.updateMapFavoriteStatus(map, true);
          this._snackBar.open(map.name + " added from favorites.", "Okay", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        });
      }
    }
  
    updateMapFavoriteStatus(map: any, isFavorite: boolean): void {
      if(!map.map_favorites) {
        map.map_favorites = [];
      }
        if (isFavorite) {
          map.map_favorites.push({id: this.sharedDataService.currentUser.id});
        } else {
          map.map_favorites = map.map_favorites.filter((fav: { id: Number; }) => fav.id !== this.sharedDataService.currentUser.id);
        }
    }

    preprocessWeaponry(weaponry: any[]): any[] {
      const weaponCounts = weaponry.reduce((acc, weapon) => {
        const id = weapon.weapon_info.id; 
        if (!acc[id]) {
          acc[id] = { ...weapon, quantity: 1 };
        } else {
          acc[id].quantity++;
        }
        return acc;
      }, {});
    
      return Object.values(weaponCounts);
    }

    setRegimentData(mapData: any) { 
        if (mapData.usa_regiments) {
          Object.keys(mapData.usa_regiments).forEach(regimentType => {
            mapData.usa_regiments[regimentType].forEach((regiment: { regiment_weaponry: any[]; }) => {
              regiment.regiment_weaponry = this.preprocessWeaponry(regiment.regiment_weaponry);
            });
          });
        }

        if (mapData.csa_regiments) {
          Object.keys(mapData.csa_regiments).forEach(regimentType => {
            mapData.csa_regiments[regimentType].forEach((regiment: { regiment_weaponry: any[]; }) => {
              regiment.regiment_weaponry = this.preprocessWeaponry(regiment.regiment_weaponry);
            });
          });
        }

      this.map = mapData;
    }

    async getCurrentNotes(): Promise<void> {
      const currentUserId = this.sharedDataService.currentUser.id;
      const currentMapId = this.route.snapshot.params["id"];
      console.log("Current map id:", currentMapId);
      console.log("Current user id:", currentUserId);
    
      return new Promise((resolve, reject) => {
        this.noteService.getById(currentMapId, currentUserId).subscribe({
          next: (notes: Note[]) => {
            if (notes && notes.length > 0) {
              this.currentNotes = notes[0].note;
              console.log("Current notes:", this.currentNotes);
            } else {
              this.currentNotes = ''; 
              console.log("No notes found for the current map and user.");
            }
            resolve();
          },
          error: (error) => {
            console.error(error);
            reject(error);
          },
        });
      });
    }
    
    getFavoritesTooltip(): string {
      if (!this.map.map_favorites || this.map.map_favorites.length === 0) {
        return 'Be the first to favorite this map.';
      }
    
      const validUsernames = this.map.map_favorites.map((fav: { username: string; }) => fav.username).filter((username: string) => !!username);
    
      if (validUsernames.length === 0) {
        return 'Be the first to favorite this map.';
      }
    
      if (validUsernames.length === 1) {
        return `${validUsernames[0]} favorited this.`;
      }
    
      const allButLast = validUsernames.slice(0, -1);
      const lastUsername = validUsernames[validUsernames.length - 1];
      return `Favorited by ${allButLast.join(', ')}, and ${lastUsername}.`;
    }
    
    
  
    /**
     * save notes
     * This is a function that saves the notes
     * @param noteText - the text of the note
     * @param mapId - the id of the map
     */
    saveNotes(noteText: string, mapId: string): void {
      const currentUserId = this.token.getUser().id;
      this.noteService.createOrUpdate(mapId, currentUserId, noteText).subscribe(
        () => {
          this.openSnackBar("Note saved successfully.", 2000);
          this.getCurrentNotes();
        },
        (error) => {
          console.error(error);
          this.openSnackBar("Failed to save note. Please try again.", 2000);
        }
      );
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

      copyToClipboard(text: string) {
        this.clipboard.copy(text);
      }

      open(url: any, title: any, w: any, h: any) {
        var left = screen.width / 2 - w / 2;
        var top = screen.height / 2 - h / 2;
        return window.open(
          url,
          title,
          "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
            w +
            ", height=" +
            h +
            ", top=" +
            top +
            ", left=" +
            left
        );
      }
  
}

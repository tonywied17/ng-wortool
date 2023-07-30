import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Input,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { MapService } from "../_services/map.service";
import { NoteService } from "../_services/note.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SafePipe } from "../_helpers/safe.pipe";
import { TokenStorageService } from "../_services/token-storage.service";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { Clipboard } from "@angular/cdk/clipboard";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { Note } from "../_models/note.model";
import { Favorite } from "../_models/favorite";
import { AuthService } from "../_services/auth.service";
import { FavoriteService } from "../_services/favorite.service";
import { Location } from "@angular/common";
import { ViewportScroller } from "@angular/common";

@Component({
  selector: "app-map-details",
  templateUrl: "./map-details.component.html",
  styleUrls: ["./map-details.component.scss"],
  providers: [SafePipe, CdkDrag, CdkDragHandle],
})
export class MapDetailsComponent implements OnInit {
  @ViewChild("dialogTemplate")
  _dialogTemplate!: TemplateRef<any>;

  private _overlayRef!: OverlayRef;
  private _portal!: TemplatePortal;
  data: any;
  CamMapBool: boolean = false;
  CamMap: string = "Disabled";
  ytSrc: string = "https://www.youtube.com/embed/";
  isLoggedIn = false;
  showMod = false;
  showUser = false;
  showAdmin = false;
  currentNotes: any;
  currentFavorites: any;
  isFavorited = false;
  currentUser: any;
  loading = true;
  selectedOption!: string;
  @Input() viewMode = false;
  @Input() currentMap: any;

  constructor(
    private mapService: MapService,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private router: Router,
    private token: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private location: Location,
    private viewportScroller: ViewportScroller
  ) {}

  goBack(): void {
    this.location.back();
  }

  openSnackBar(message: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.horizontalPosition = "center";
    config.verticalPosition = "top";

    this._snackBar.open(message, "Okay", config);
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
  }

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

  ngOnDestroy() {
    this._overlayRef.dispose();
  }

  openDialog() {
    this._overlayRef.attach(this._portal);
  }

  closePopup() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }
  }

  ngOnInit(): void {
    this.getMap(this.route.snapshot.params["id"]);
    this.getCurrentNotes();

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
          this.loading = false;
          this.getFavorites(this.route.snapshot.params["id"], userID);
        },
        (error) => {
          if (error.status === 403) {
            this.showUser = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );

      this.authService.checkModeratorRole(userID, this.currentUser.regimentId).subscribe(
        (response) => {
          this.showMod = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );

      this.authService.checkAdminRole(userID).subscribe(
        (response) => {
          this.showAdmin = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showAdmin = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  getFavorites(mapId: string, userId: string): void {
    this.favoriteService.getByBothIds(mapId, userId).subscribe({
      next: (favorite: Favorite[]) => {
        if (favorite && favorite.length > 0 && favorite[0].mapId == mapId && favorite[0].userId == userId) {
          this.isFavorited = true;
        } else {
          this.isFavorited = false;
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  

  toggleFavorite(mapId: string, userId: string): void {
    this.favoriteService.getByBothIds(mapId, userId).subscribe({
      next: (favorite: Favorite[]) => {
        if (favorite && favorite.length > 0) {
          this.favoriteService.delete(mapId, userId).subscribe(
            () => {
              this.openSnackBar(
                this.currentMap.map + " removed from your favorites.",
                200000
              );
              this.isFavorited = false;
            },
            (error) => {
              console.error(error);
              this.openSnackBar(
                "Failed to remove map from favorites. Please try again.",
                200000
              );
            }
          );
        } else {
          const currentRoute = this.router.url;
          this.favoriteService
            .createOrUpdate(currentRoute, mapId, userId, "map")
            .subscribe(
              () => {
                this.openSnackBar(
                  this.currentMap.map + " added to your favorites.",
                  200000
                );
                this.isFavorited = true;
              },
              (error) => {
                console.error(error);
                this.openSnackBar(
                  "Failed to add " +
                    this.currentMap.map +
                    " to favorites. Please try again.",
                  200000
                );
              }
            );
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getCurrentNotes(): void {
    const currentUserId = this.token.getUser().id;
    const currentMapId = this.route.snapshot.params["id"];

    this.noteService.getById(currentMapId, currentUserId).subscribe({
      next: (notes: Note[]) => {
        this.currentNotes = notes[0].note;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

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

  getMap(id: string): void {
    this.mapService.get(id).subscribe({
      next: (data) => {
        if (data) {
          this.currentMap = data;
        } else {
          // Handle the case when data is empty or undefined
          console.error("No data received from the API.");
        }
      },
      error: (e) => console.error(e),
    });
  }
  

  toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this.CamMap = "Enabled";
      this.CamMapBool = true;

      this.cdr.detectChanges();

      const videoContainer = document.getElementById("videoContainer");
      if (videoContainer) {
        const youtubeUrl = `https://www.youtube.com/embed/${this.currentMap.youtube}`;
        const iframeHtml = `<iframe class="h-[100%]" width="100%" src="${youtubeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 0.375rem;"></iframe>`;
        videoContainer.innerHTML = iframeHtml;
      }
    } else {
      this.CamMap = "Disabled";
      this.CamMapBool = false;
    }
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

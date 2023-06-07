import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  Input,
  TemplateRef,
  AfterViewInit,
  ViewContainerRef,
  OnDestroy,
} from "@angular/core";
import { Map } from "../_models/map.model";
import { MapService } from "../_services/map.service";
import { NoteService } from "../_services/note.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SafePipe } from "../_helpers/safe.pipe";
import { NgModel } from "@angular/forms";
import { TokenStorageService } from "../_services/token-storage.service";
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
} from "@angular/material/snack-bar";
import { Clipboard } from "@angular/cdk/clipboard";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CdkDrag, CdkDragHandle, CdkDragMove } from "@angular/cdk/drag-drop";
import { Note } from "../_models/note.model";
import { AuthService } from "../_services/auth.service";

@Component({
  selector: "app-map-details",
  templateUrl: "./map-details.component.html",
  styleUrls: ["./map-details.component.scss"],
  providers: [SafePipe, CdkDrag, CdkDragHandle], // Include the SafePipe in the providers array
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
  private roles: string[] = [];
  currentNotes: any;
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
    private authService: AuthService
  ) {}

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

      //check moderator role
      this.authService.checkModeratorRole(userID).subscribe(
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

      //check admin role
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

  getCurrentNotes(): void {
    const currentUserId = this.token.getUser().id;
    const currentMapId = this.route.snapshot.params["id"];

    this.noteService.getById(currentMapId, currentUserId).subscribe({
      next: (notes: Note[]) => {
        // Update the type annotation to Note[]
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
        // this.closePopup();
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
        this.currentMap = data;
      },
      error: (e) => console.error(e),
    });
  }

  toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this.CamMap = "Enabled";
      this.CamMapBool = true;

      this.cdr.detectChanges(); // Trigger change detection

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

  /**
   *
   * @param url
   * @param title
   * @param w
   * @param h
   * @returns
   */
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

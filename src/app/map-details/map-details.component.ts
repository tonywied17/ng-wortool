import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef, Input, TemplateRef, AfterViewInit, ViewContainerRef, OnDestroy,} from "@angular/core";
import { Map } from "../_models/map.model";
import { MapService } from "../_services/map.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SafePipe } from "../_helpers/safe.pipe";
import { NgModel } from "@angular/forms";
import { TokenStorageService } from '../_services/token-storage.service';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

@Component({
  selector: "app-map-details",
  templateUrl: "./map-details.component.html",
  styleUrls: ["./map-details.component.scss"],
  providers: [SafePipe, CdkDrag, CdkDragHandle], // Include the SafePipe in the providers array
})
export class MapDetailsComponent implements OnInit {
  @ViewChild('dialogTemplate')
  _dialogTemplate!: TemplateRef<any>;

  private _overlayRef!: OverlayRef;
  private _portal!: TemplatePortal;
  data: any;
  CamMapBool: boolean = false;
  CamMap: string = "Disabled";
  ytSrc: string = "https://www.youtube.com/embed/";
  isLoggedIn = false;
  showUser = false;
  showAdmin = false;
  private roles: string[] = [];
  @Input() viewMode = false;
  @Input() currentMap: any;

  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router,
    private token: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private _overlay: Overlay, 
    private _viewContainerRef: ViewContainerRef
  ) {}

  openSnackBar(message: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
  
    this._snackBar.open(message, 'Okay', config);
  }
  

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
  }

  ngAfterViewInit() {
    this._portal = new TemplatePortal(this._dialogTemplate, this._viewContainerRef);
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
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

    this.isLoggedIn = !!this.token.getToken();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      this.showUser = true
    }
  }

  getMap(id: string): void {
    this.mapService.get(id).subscribe({
      next: (data) => {
        this.currentMap = data;
        // console.log(data);
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

/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\weapons\weapons.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 12:23:45 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { WeaponService } from "src/app/_services/weapon.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { AuthService } from "src/app/_services/auth.service";
import { Location } from "@angular/common";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatDialog } from "@angular/material/dialog";
import { TemplatePortal } from "@angular/cdk/portal";
import { MapImageModalComponent } from "../maps/map-image-modal/map-image-modal.component";

@Component({
  selector: "app-weapons",
  templateUrl: "./weapons.component.html",
  styleUrls: ["./weapons.component.scss"],
})
export class WeaponsComponent implements OnInit {
  test(arg0: string) {
    alert(arg0);
  }

  weaponForm: any = {
    weapon: null,
    type: null,
    range: null,
    lengthy: null,
    ammo: null,
    image: null,
    notes: null,
  };

  @ViewChild("dialogTemplate")
  _dialogTemplate!: TemplateRef<any>;
  private _overlayRef!: OverlayRef;
  private _portal!: TemplatePortal;

  errorMessage = "";
  weaponsObj: any;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  contentLoaded = false;
  submitted = false;
  spotlight: any;
  activeWeaponId: string | null = null;

  constructor(
    private weaponService: WeaponService,
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) {}

  /**
   * On init
   */
  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkAdminRole(userID).subscribe(
        (response) => {
          this.showAdmin = response.access;
        },
        (error) => {
          if (error.status === 403) {
            this.showAdmin = false;
          } else {
            console.error("Error:", error);
            if (this.isLoggedIn) {
            }
          }
        }
      );
    }
    this.weaponService.getAll().subscribe((data) => {
      this.weaponsObj = JSON.parse(data);
      this.loadWeapon(this.weaponsObj[0]);

      this.contentLoaded = true;
    });
    this.route.params.subscribe((params: Params) => {
      const weaponId = params["weapon"];
      // // console.log("route found for: " + weaponId);
      if (weaponId) {
        this.weaponService.get(weaponId).subscribe((data) => {
          this.loadWeapon(JSON.parse(data));
        });
      }
    });
  }

  /**
   * Load weapon
   * This function is used to load a weapon from the list
   * @param weapon - weapon object 
   */
  loadWeapon(weapon: any) {
    this.spotlight = null;
    setTimeout(() => {
      this.spotlight = weapon;
    }, 0);
    this.location.replaceState("/weapons/" + weapon.id);

    this.activeWeaponId = weapon.id;
  }

  /**
   * Open a new window
   * This function is used to open a new window
   * @param url - url to open
   * @param title - title of the window
   * @param w - width
   * @param h - height
   * @returns - window
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

/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-admin\manage-weapons\manage-weapons.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:46:30 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../../_services/token-storage.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { WeaponService } from "../../_services/weapon.service";
import { firstValueFrom } from "rxjs";
import { ConfirmDeleteSnackbarComponent } from "../../confirm-delete-snackbar/confirm-delete-snackbar.component";

@Component({
  selector: "app-manage-weapons",
  templateUrl: "./manage-weapons.component.html",
  styleUrls: ["./manage-weapons.component.scss"],
})
export class ManageWeaponsComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;

  weaponName: string = "";
  weaponType: string = "";
  weaponRange: string = "";
  weaponLength: string = "";
  weaponAmmo: string = "";
  weaponImage: string = "";
  weaponNotes: string = "";

  weaponsList!: any[];
  selectedWeaponId: any;

  isCreating = false;
  isUpdating = false;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private weaponService: WeaponService
  ) {}

  /**
   * On init
   */
  ngOnInit(): void {
    this.loadWeapons();

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    this.route.params.subscribe((params: Params) => {
      const weaponId = params["weapon"];
      if (weaponId) {
        this.selectedWeaponId = weaponId;
        setTimeout(() => {
          this.handleSelectionChange();
        }, 200);
        this.isUpdating = true;
        this.isCreating = false;
      }
    });
  }

  /**
   * Load weapons
   * This function is used to load all weapons
   */
  loadWeapons(): void {
    this.weaponService.getAll().subscribe(
      (data: any) => {
        this.weaponsList = JSON.parse(data);
      },
      (error: any) => {
        
      }
    );
  }

  /**
     Handle selection change
   * This function is used to handle the selection change
   */
  handleSelectionChange() {
    if (this.selectedWeaponId) {
      const selectedIndex = this.weaponsList.findIndex(
        (weapon) => weapon.id === parseInt(this.selectedWeaponId)
      );

      
      if (selectedIndex !== -1) {
        const selectedWeapon = this.weaponsList[selectedIndex];
        // 
        this.weaponName = selectedWeapon.weapon;
        this.weaponType = selectedWeapon.type;
        this.weaponRange = selectedWeapon.range;
        this.weaponLength = selectedWeapon.lengthy;
        this.weaponAmmo = selectedWeapon.ammo;
        this.weaponImage = selectedWeapon.image;
        this.weaponNotes = selectedWeapon.notes;
        this.isCreating = false;
        this.isUpdating = true;
      }
    }
  }

  /**
   * Create new
   * This function is used to reset the form and create a new weapon
   */
  createNew() {
    this.weaponName = "";
    this.weaponType = "";
    this.weaponRange = "";
    this.weaponLength = "";
    this.weaponAmmo = "";
    this.weaponImage = "";
    this.weaponNotes = "";
    this.selectedWeaponId = "";
    this.isCreating = true;
    this.isUpdating = false;
  }

  /**
   * Back
   * This function is used to reset the form and go back to the previous page
   */
  back() {
    this.weaponName = "";
    this.weaponType = "";
    this.weaponRange = "";
    this.weaponLength = "";
    this.weaponAmmo = "";
    this.weaponImage = "";
    this.weaponNotes = "";
    this.selectedWeaponId = "";
    this.isUpdating = false;
    this.isCreating = false;
  }

  /**
   * Show snack bar
   * This function is used to show a snackbar
   * @param message - string - the message
   */
  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  /**
   * Create or update weapon
   * This function is used to create or update a weapon
   * @returns - Promise<void>
   */
  async createOrUpdateWeapon() {
    if (!this.weaponName || !this.weaponType) {
      this.showSnackBar("Please fill in at least the weapon name & type.");
      return;
    }

    let userId = this.currentUser.id;
    let selectedWeaponId = this.selectedWeaponId || undefined;

    try {
      const response: any = await firstValueFrom(
        this.weaponService.createOrUpdate(
          userId,
          this.weaponName,
          this.weaponType,
          this.weaponRange,
          this.weaponLength,
          this.weaponAmmo,
          this.weaponImage,
          this.weaponNotes,
          selectedWeaponId
        )
      );
      if (response && response.message) {
        this.showSnackBar(response.message);
      } else {
        this.showSnackBar("Weapon updated successfully!");
      }
    } catch (error: any) {
      this.showSnackBar("An error occurred while updating the weapon.");
    }

    this.loadWeapons();

    this.back();
  }

  /**
   * Confirm delete
   * This function is used to confirm the deletion of a weapon
   */
  confirmDelete(): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to delete '${this.weaponName}' from weapons?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.deleteWeapon();
    });
  }

  /**
   * Delete weapon
   * This function is used to delete a weapon
   */
  deleteWeapon() {
    let userId = this.currentUser.id;

    if (this.selectedWeaponId) {
      const selectedIndex = this.weaponsList.findIndex(
        (weapon) => weapon.id === parseInt(this.selectedWeaponId)
      );

      // 
      if (selectedIndex !== -1) {
        const selectedWeapon = this.weaponsList[selectedIndex];
        // 
        this.weaponService.delete(userId, selectedWeapon.id).subscribe(
          (response) => {
            // 
            this.showSnackBar("Weapon deleted successfully!");
            this.loadWeapons();
            this.createNew();
            this.isCreating = false;
          },
          (error) => {
            
            this.showSnackBar("An error occurred while deleting the weapon.");
          }
        );
      }
    }
  }
}

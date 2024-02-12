/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-user\board-user.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 5:06:01 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { AuthService } from "src/app/_services/auth.service";
import { AuthInjectionServiceService } from "src/app/_services/auth-injection-service.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from "../../confirm-cancel-snackbar/confirm-cancel-snackbar.component";
import { FavoriteService } from "src/app/_services/favorite.service";
import { MapService } from "src/app/_services/map.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { DiscordService } from "src/app/_services/discord.service";
import { RegimentService } from "src/app/_services/regiment.service";

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  @ViewChild("selectBox") selectBox: any;

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectBox.nativeElement.selectedIndex = 0;
    }, 500);
  }

  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;
  guild_avatar_url = "";
  showPage1 = false;
  showPage2 = false;
  showPage3 = false;

  loading = true;

  passwordCurrent: string = "";
  passwordNew: string = "";
  passwordNewConfirm: string = "";

  email: string = "";
  avatar_url: any;
  discordId: string = "";
  regimentId: string = "";
  discordSyncUrl: string = "";
  useAvatarUrl = false;
  discordIsSynced = false;
  regimentSelected = false;
  discordData: any;
  regimentData: any;
  allRegimentsList: any;
  stillSelecting = false;

  currentFavorites: any;
  hasFavorites = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSize: number = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sharedService: AuthInjectionServiceService,
    private snackBar: MatSnackBar,
    private favoriteService: FavoriteService,
    private mapService: MapService,
    private router: Router,
    private httpClient: HttpClient,
    private location: Location,
    private discordService: DiscordService,
    private regimentService: RegimentService
  ) {}

  /**
   * onPageSizeChange
   * This function is used to change the page size of the table
   * @param event - any - the event
   */
  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
    localStorage.setItem("pageSize", event.pageSize);
  }

  /**
   * On init
   */
  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.getAllRegiments();

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    this.email = this.currentUser.email;
    this.avatar_url = this.currentUser.avatar_url;
    this.discordId = this.currentUser.discordId;
    this.regimentId = this.currentUser.regimentId;

    if (this.discordId) {
      this.discordSyncUrl = `https://api.wortool.com/v2/discord/`;
    }

    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      try {
        const response = await this.authService
          .checkUserRole(userID)
          .toPromise();
        this.showUser = response.access;
        await this.getDiscordUser();
        this.getFavorites();
        await this.getRegiment();
        this.loading = false;
        
      } catch (error: any) {
        if (error.status === 403) {
          this.showUser = false;
        } else {
          console.error("Error:", error);
        }
        this.loading = false;
      }
    } else {
      this.loading = false;
    }

    const storedPageSize = localStorage.getItem("pageSize");
    this.pageSize = storedPageSize ? +storedPageSize : 5;
  }

  /**
   * Get favorites
   * This function is used to get all the favorites for the current user
   * @returns - void
   */
  private getFavorites(): void {
    const userID = this.currentUser.id;

    this.favoriteService.getByUserId(userID).subscribe(
      (response) => {
        this.currentFavorites = response;
        if (this.currentFavorites && this.currentFavorites.length > 0) {
          this.hasFavorites = true;

          this.mapService.getAll().subscribe({
            next: (maps) => {
              for (const favorite of this.currentFavorites) {
                const matchingMap = maps.find(
                  (map) => map.id === favorite.mapId
                );
                if (matchingMap) {
                  favorite.mapData = matchingMap;
                }
              }
              this.dataSource.data = this.currentFavorites;
              this.dataSource.paginator = this.paginator;
              this.paginator.pageSize = this.pageSize;
            },
            error: (error) => console.error("Error:", error),
          });
        } else {
          this.hasFavorites = false;
        }
      },
      (error) => {
        console.error("Error:", error);
      }
    );
  }

  /**
   * Go back
   * This function is used to go back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Load content
   * This function is used to load the content for the selected page
   * @param page - string - the page number
   */
  private loadContent(page: string): void {
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;

    if (page === "1") {
      this.showPage1 = true;
    } else if (page === "2") {
      this.showPage2 = true;
    } else if (page === "3") {
      this.showPage3 = true;
    }
  }

  /**
   * Update password
   * This function is used to update the password
   * @returns - void
   */
  async updatePassword() {
    if (
      !this.passwordCurrent ||
      !this.passwordNew ||
      !this.passwordNewConfirm
    ) {
      this.showSnackBar("Please fill in all the fields.");
      return;
    }

    if (this.passwordNew.length < 6) {
      this.showSnackBar("New password must be at least 6 characters long.");
      return;
    }

    if (this.passwordNew !== this.passwordNewConfirm) {
      this.showSnackBar("New passwords do not match!");
      return;
    }

    const userId = this.currentUser.id;
    try {
      await this.authService
        .password(userId, this.passwordCurrent, this.passwordNew)
        .toPromise();
      this.showSnackBar("Password updated successfully!");
      this.passwordCurrent = "";
      this.passwordNew = "";
      this.passwordNewConfirm = "";
      this.logout();
    } catch (error: any) {
      if (error.status === 401) {
        this.showSnackBar("Current password doesn't match!");
      } else {
        this.showSnackBar("An error occurred while updating the password.");
      }
    }
  }

  /**
   * Sync user account with discord
   * This function is used to sync the user account with discord
   */
  sync(): void {
    const state = encodeURIComponent(this.currentUser.id);
    const left = window.screenX + 100;

    const popupUrl = `https://api.wortool.com/v2/discord/?state=${state}`;

    const popupWindow = window.open(
      popupUrl,
      "_blank",
      `width=610,height=900,left=${left}`
    );

    // Check if the popup window is available
    if (popupWindow !== null) {
      // Attach the message event listener to the popup window
      popupWindow.addEventListener("message", (event) => {
        if (event.data === "popupClosed") {
          this.continueAuthentication(event.origin, state);
        }
      });

      // Check if the popup window has been closed
      const checkClosed = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(checkClosed);
          // Retrieve the state parameter from the backend and continue authentication flow
          this.continueAuthentication(
            "https://api.wortool.com/v2/discord/auth/",
            state
          );
        }
      }, 1000);
    } else {
      console.error("Failed to open the popup window.");
    }
  }

  continueAuthentication(origin: string, state: string): void {
    // Pass the state parameter as a query parameter in the request URL

    const message = `UserID: ${state} has been synced with Discord!`;

    const backendUrl = `https://api.wortool.com/v2/discord/user/${state}`;

    // once stored in db model we will retrieve the object and update the user object with discord info
    // // console.log("backendUrl: ", backendUrl);

    this.discordService.getOne(state).subscribe((response) => {
      // // console.log(response);
      this.discordData = response;
      this.discordId = this.discordData.discordId;
      this.discordIsSynced = true;
      this.updateProfile();
      this.snackBar.open(message, "Close", {
        verticalPosition: "top",
        duration: 3000,
      });
    });
  }

  /**
   * Update avatar url
   * This function is used to update the avatar url
   */
  updateAvatarUrl() {
    if (this.discordIsSynced) {
      this.avatar_url = this.discordData.avatar;
    }
  }

  /**
   * Update profile
   * This function is used to update the profile
   * @param alert - boolean - whether to show the snackbar or not
   */
  async updateProfile(alert: boolean = true) {
    const userId = this.currentUser.id;

    this.email = this.email || '';
    this.avatar_url = this.avatar_url || '';
    this.discordId = this.discordId || '';
    this.regimentId = this.regimentId || '';


    try {
      await this.authService
      .profile(
        userId,
        this.email,
        this.avatar_url,
        this.discordId,
        this.regimentId
      )
      .toPromise();

        if (alert){
          this.showSnackBar("Profile updated successfully!");
        }
      
      this.stillSelecting = false;

      const updatedUser = {
        ...this.currentUser,
        email: this.email,
        avatar_url: this.avatar_url,
        discordId: this.discordId,
        regimentId: this.regimentId,
      };

      this.token.saveUser(updatedUser);

      this.email = updatedUser.email;
      this.avatar_url = updatedUser.avatar_url;
      this.discordId = updatedUser.discordId;
      this.regimentId = updatedUser.regimentId;

      if (this.regimentId != null) {
        const selectedRegiment = this.allRegimentsList.find(
          (regiment: { id: any }) => regiment.id == this.regimentId
        );
        if (selectedRegiment) {
          this.regimentData = selectedRegiment;
          this.regimentSelected = true;
        } else {
          this.regimentData = null;
          this.regimentSelected = false;
        }
      }

      // this.discordSyncUrl = `https://api.wortool.com/v2/discord/guild/${this.regimentId}/user/${updatedUser.discordId}/get`
    } catch (error: any) {
      if (error.status === 400) {
        this.showSnackBar(error.error.message);
      } else {
        this.showSnackBar(error.message);
      }
    }
  }

  /**
   * Logout
   * This function is used to logout the user
   * @returns - void
   */
  logout(): void {
    this.token.signOut();
    this.authService.isAuthenticated = false;
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("isAdmin", "false");
    localStorage.setItem("isModerator", "false");
    this.isLoggedIn = this.authService.isAuthenticated;
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;
    this.showUser = this.authService.isAuthenticated;

    this.sharedService.triggerLogoutEvent();

    this.sharedService.setIsLoggedIn(false);

    this.router.navigate(["/home"]);
  }

  /**
   * Show snackbar
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
   * Delete favorite
   * This function is used to delete a favorite
   * @param mapId - string - the map id
   */
  deleteFavorite(mapId: string) {
    let userId = this.currentUser.id;

    this.favoriteService.delete(mapId, userId).subscribe((response) => {
      this.getFavorites();
      this.showSnackBar("Favorite Deleted");
    });
  }

  /**
   * Confirm delete
   * This function is used to confirm the deletion of a favorite
   * @param mapId - string - the map id
   * @param mapName - string - the map name
   */
  confirmDelete(mapId: string, mapName: string): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to delete '${mapName}' as a favorite?`,
          mapId,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.deleteFavorite(mapId);
    });
  }

  /**
   * Confirm unSync of discord account
   * This function is used to confirm the unSync of a discord account
   */
  confirmUnSync(): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove your Discord Account?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.remove();
    });
  }

  /**
   * Get discord user
   * This function is used to get the discord user data
   * @returns - Promise<void>
   */
  async getDiscordUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userId = this.currentUser.id;
      const discordId = this.currentUser.discordId;

      if (!discordId) {
        this.discordIsSynced = false;
        resolve();
      } else {
        this.discordService.getOne(userId).subscribe(
          (response) => {
            // // console.log(response);
            this.discordData = response;
            this.discordIsSynced = true;
            resolve(); 
          },
          (error) => {
            reject(error); 
          }
        );
      }
    });
  }

  /**
   * Get regiment
   * This function is used to get the regiment data
   * @returns - Promise<void>
   */
  async getRegiment(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const regimentId = this.currentUser.regimentId;

      if (!regimentId) {
        this.regimentSelected = false;
        resolve(); 
      } else {
        this.regimentService.getRegiment(regimentId).subscribe(
          (response) => {
            // // console.log(response);
            this.regimentData = response;
            this.regimentSelected = true;
            resolve();
          },
          (error) => {
            reject(error); 
          }
        );
      }
    });
  }

  /**
   * Get all regiments
   * This function is used to get all the regiments
   */
  getAllRegiments() {
    this.regimentService.getRegiments().subscribe((response) => {
      this.allRegimentsList = response;
    });
  }

  /**
   * Update regiment
   * This function is used to update the regiment
   */
  updateRegiment() {
    const selectedRegiment = this.allRegimentsList.find(
      (regiment: { id: any }) => regiment.id == this.regimentId
    );
    if (selectedRegiment) {
      this.regimentData = selectedRegiment;
      this.stillSelecting = true;
      this.confirmSyncRegiment();
    } else {
      this.guild_avatar_url = "";
      this.regimentData = null;
      this.regimentSelected = false;
    }
  }

  /**
   * Remove discord account after confirmation
   * This function is used to remove the discord account
   */
  remove() {
    this.discordService
      .removeDiscordUser(this.currentUser.id)
      .subscribe((response) => {
        // // console.log(response);
        this.discordData = null;
        this.discordIsSynced = false;
        this.discordId = "";
        this.updateProfile();
        this.snackBar.open("Discord account removed", "Close", {
          verticalPosition: "top",
          duration: 3000,
        });
      });
  }

  /**
   * Confirm sync regiment
   * This function is used to confirm the sync of a regiment
   */
  confirmSyncRegiment() {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to join ${this.regimentData.regiment}?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.updateProfile();
    });
  }

  /**
   * Confirm unSync regiment
   * This function is used to confirm the unSync of a regiment
   */
  confirmUnSyncRegiment() {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove your Regiment?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeRegiment();
    });
  }

  /**
   * Remove regiment
   * This function is used to remove the regiment after confirmation
   */
  removeRegiment() {
    this.regimentService
      .removeUsersRegiment(this.currentUser.id)
      .subscribe((response: any) => {
        // // console.log(response);
        this.regimentData = null;
        this.regimentSelected = false;
        this.regimentId = "";
        this.updateProfile();
        this.snackBar.open("Regiment removed", "Close", {
          verticalPosition: "top",
          duration: 3000,
        });
      });
  }
}

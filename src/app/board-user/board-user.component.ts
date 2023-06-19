import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { SharedService } from "../_services/shared.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmDeleteSnackbarComponent } from "../confirm-delete-snackbar/confirm-delete-snackbar.component";
import { FavoriteService } from "../_services/favorite.service";
import { MapService } from "../_services/map.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { DiscordService } from "../_services/discord.service";
import { RegimentService } from "../_services/regiment.service";

@Component({
  selector: "app-board-user",
  templateUrl: "./board-user.component.html",
  styleUrls: ["./board-user.component.scss"],
})


export class BoardUserComponent implements OnInit {
  
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
  avatar_url: string = "";
  discordId: string = "";
  regimentId: string = "";
  discordSyncUrl: string = "";
  useAvatarUrl = false;
  discordIsSynced = false;
  regimentSelected = false;
  discordData: any;
  regimentData: any;
  allRegimentsList: any;

  currentFavorites: any;
  hasFavorites = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSize: number = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private favoriteService: FavoriteService,
    private mapService: MapService,
    private router: Router,
    private httpClient: HttpClient,
    private location: Location,
    private discordService: DiscordService,
    private regimentService: RegimentService
  ) {}

  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
    localStorage.setItem("pageSize", event.pageSize);
  }

  ngOnInit(): void {
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
      this.discordSyncUrl = `https://api.tonewebdesign.com/pa/discord/`;
    }

    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
          this.getDiscordUser();
          this.getFavorites();
          this.getRegiment();
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
    } else {
      this.loading = false;
    }

    const storedPageSize = localStorage.getItem("pageSize");
    this.pageSize = storedPageSize ? +storedPageSize : 5;
  }

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

  goBack(): void {
    this.location.back();
  }

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

  sync(): void {
    const state = encodeURIComponent(this.currentUser.id);
    const left = window.screenX + 100;

    const popupUrl = `https://api.tonewebdesign.com/pa/discord/?state=${state}`;

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
            "https://api.tonewebdesign.com/pa/discord/auth/",
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

    const backendUrl = `https://api.tonewebdesign.com/pa/discord/user/${state}`;

    // once stored in db model we will retrieve the object and update the user object with discord info
    console.log("backendUrl: ", backendUrl);

    this.discordService.getOne(state).subscribe((response) => {
      console.log(response);
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

  updateAvatarUrl() {
    if (this.discordIsSynced) {
      this.avatar_url = this.discordData.avatar;
    }
  }

  async updateProfile() {
    const userId = this.currentUser.id;
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
      this.showSnackBar("Profile updated successfully!");

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
        const selectedRegiment = this.allRegimentsList.find((regiment: { id: any }) => regiment.id == this.regimentId);
        if (selectedRegiment) {
          this.regimentData = selectedRegiment;
          this.regimentSelected = true;
        } else {
          this.regimentData = null;
          this.regimentSelected = false;
        }
      }
      
      // this.discordSyncUrl = `https://api.tonewebdesign.com/pa/discord/guild/${this.regimentId}/user/${updatedUser.discordId}/get`
    } catch (error: any) {
      if (error.status === 400) {
        this.showSnackBar(error.error.message);
      } else {
        this.showSnackBar(error.message);
      }
    }
  }

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


  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  deleteFavorite(mapId: string) {
    let userId = this.currentUser.id;

    this.favoriteService.delete(mapId, userId).subscribe((response) => {
      this.getFavorites();
      this.showSnackBar("Favorite Deleted");
    });
  }

  confirmDelete(mapId: string, mapName: string): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
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

  getDiscordUser() {
    let userId = this.currentUser.id;

    let discordId = this.currentUser.discordId;

    if (!discordId) {
      this.discordIsSynced = false;
      return;
    } else {
      this.discordService.getOne(userId).subscribe((response) => {
        console.log(response);
        this.discordData = response;
        this.discordIsSynced = true;
      });
    }
  }

  getRegiment() {
    let regimentId = this.currentUser.regimentId;

    if (!regimentId) {
      this.regimentSelected = false;
    } else {
      this.regimentService.getRegiment(regimentId).subscribe((response) => {
        console.log(response);
        this.regimentData = response;
        this.regimentSelected = true;
      });
    }
  }

  getAllRegiments() {
    this.regimentService.getRegiments().subscribe((response) => {
      console.log(response);
      this.allRegimentsList = response;
    });
  }

  updateGuildAvatar() {
    const selectedRegiment = this.allRegimentsList.find((regiment: { id: any }) => regiment.id == this.regimentId);
    if (selectedRegiment) {
      this.guild_avatar_url = selectedRegiment.guild_avatar;
      this.regimentData = selectedRegiment;
      
    } else {
      this.guild_avatar_url = '';
      this.regimentData = null;
      this.regimentSelected = false;
    }
  }
  
  
  
  

}

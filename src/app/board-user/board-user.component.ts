import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router, ParamMap, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { SharedService } from "../_services/shared.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpHeaders } from "@angular/common/http";
import { FavoriteService } from "../_services/favorite.service";
import { MapService } from "../_services/map.service";

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

  showPage1 = false;
  showPage2 = false;
  showPage3 = false;

  loading = true;

  private roles: string[] = [];

  passwordCurrent: string = "";
  passwordNew: string = "";
  passwordNewConfirm: string = "";

  email: string = "";
  avatar_url: string = "";
  discordId: string = "";
  discordSyncUrl: string = "";

  currentFavorites: any;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private favoriteService: FavoriteService,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    this.email = this.currentUser.email;
    this.avatar_url = this.currentUser.avatar_url;

    this.discordId = this.currentUser.discordId;

    if(this.discordId){
      this.discordSyncUrl = `https://api.tonewebdesign.com/pa/discord/guild/681641606398607401/user/${this.discordId}/get`
    }

    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
          this.getFavorites();
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
  }

  private getFavorites(): void {
    const userID = this.currentUser.id;
  
    this.favoriteService.getByUserId(userID).subscribe(
      (response) => {
        this.currentFavorites = response;
  
        this.mapService.getAll().subscribe({
          next: (maps) => {
            for (const favorite of this.currentFavorites) {
              const matchingMap = maps.find((map) => map.id === favorite.mapId);
              if (matchingMap) {
                favorite.mapData = matchingMap; // Combine map data with favorite
                console.log(favorite);
              }
            }
          },
          error: (error) => console.error("Error:", error),
        });
      },
      (error) => {
        console.error("Error:", error);
      }
    );
  }
  

  private loadContent(page: string): void {
    // Reset all flags
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;

    // Set the flag based on the 'page' parameter
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
    console.log(userId);
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

  sync(url: string): void {
    const left = window.screenX + 100;
    window.open(url, "_blank", `width=610,height=900,left=${left}`);
  }

  async updateProfile() {
    const userId = this.currentUser.id;
    console.log(userId);

    try {
      await this.authService
        .profile(userId, this.email, this.avatar_url, this.discordId)
        .toPromise();
      this.showSnackBar("Profile updated successfully!");

      // Update the currentUser object with the new data
      const updatedUser = {
        ...this.currentUser,
        email: this.email,
        avatar_url: this.avatar_url,
        discordId: this.discordId,
      };
      this.token.saveUser(updatedUser);

      // Update the input fields with the new values
      this.email = updatedUser.email;
      this.avatar_url = updatedUser.avatar_url;
      this.discordId = updatedUser.discordId;
      this.discordSyncUrl = `https://api.tonewebdesign.com/pa/discord/guild/681641606398607401/user/${updatedUser.discordId}/get`

    } catch (error: any) {
      if (error.status === 400) {
        this.showSnackBar(error.error.message); // Display the error message from the response
      } else {
        this.showSnackBar(error.message);
      }
    }
  }
  updateDiscordSyncUrl() {
    this.discordSyncUrl = `https://api.tonewebdesign.com/pa/discord/guild/681641606398607401/user/${this.discordId}/get`;
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
}

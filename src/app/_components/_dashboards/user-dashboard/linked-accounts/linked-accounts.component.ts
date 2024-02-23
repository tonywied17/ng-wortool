import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { AuthService } from "src/app/_services/auth.service";
import { DiscordService } from "src/app/_services/discord.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from "../../../confirm-cancel-snackbar/confirm-cancel-snackbar.component";
import { AuthInjectionServiceService } from "src/app/_services/auth-injection-service.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { RegimentService } from "src/app/_services/regiment.service";


@Component({
  selector: 'app-linked-accounts',
  templateUrl: './linked-accounts.component.html',
  styleUrl: './linked-accounts.component.scss'
})
export class LinkedAccountsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService,
    private token: TokenStorageService,
    private sharedService: AuthInjectionServiceService,
    private discordService: DiscordService,
    private regimentService: RegimentService,
  ) { }

  public isLoaded = false;
  discordIsSynced = false;
  discordData: any;
  stillSelecting = false;
  allRegimentsList: any;
  discordId: string = "";
  regimentSelected = false;

  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([ this.getAllRegiments() ]);
      this.isLoaded = true;
      console.log(this.sharedDataService.currentUser)
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  async getDiscordUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userId = this.sharedDataService.currentUser.id;
      const discordId = this.sharedDataService.currentUser.discordId;

      if (!discordId) {
        this.discordIsSynced = false;
        resolve();
      } else {
        this.discordService.getOne(userId).subscribe(
          (response) => {
            this.discordData = response;
            console.log("Discord Data:", this.discordData);
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

  async getAllRegiments() {
    this.regimentService.getRegiments().subscribe((response) => {
      this.allRegimentsList = response;
    });
  }

  updateRegiment() {
    const selectedRegiment = this.allRegimentsList.find(
      (regiment: { id: any }) => regiment.id == this.sharedDataService.currentUser.regimentId
    );
    if (selectedRegiment) {
      
      this.stillSelecting = true;
      this.confirmSyncRegiment(selectedRegiment);
    } else {
      this.sharedDataService.regiment.guild_avatar_url = "";
      this.sharedDataService.regiment = null;
      this.regimentSelected = false;
    }
  }

  confirmSyncRegiment(selectedRegiment: any) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to join ${selectedRegiment.regiment}?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.sharedDataService.regiment = selectedRegiment;
      this.updateProfile();
    });
  }

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

  removeRegiment() {
    this.regimentService
      .removeUsersRegiment(this.sharedDataService.currentUser.id)
      .subscribe((response: any) => {
        this.sharedDataService.regiment = null;
        this.regimentSelected = false;
        this.sharedDataService.currentUser.regimentId = "";
        this.updateProfile(false);
        this.snackBar.open("Regiment removed", "Close", {
          verticalPosition: "top",
          duration: 3000,
        });
      });
  }

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

  remove() {
    this.discordService
      .removeDiscordUser(this.sharedDataService.currentUser.id)
      .subscribe((response) => {
        this.discordData = null;
        this.discordIsSynced = false;
        this.sharedDataService.currentUser.discordId = "";
        this.discordId = "";
        this.updateProfile();
        this.snackBar.open("Discord account removed", "Close", {
          verticalPosition: "top",
          duration: 3000,
        });
      });
  }







  sync(): void {
    const state = encodeURIComponent(this.sharedDataService.currentUser.id);
    const left = window.screenX + 100;

    const popupUrl = `https://api.wortool.com/v2/discord/auth/?state=${state}`;

    const popupWindow = window.open(
      popupUrl,
      "_blank",
      `width=610,height=900,left=${left}`
    );

    if (popupWindow !== null) {
      popupWindow.addEventListener("message", (event) => {
        if (event.data === "popupClosed") {
          this.continueAuthentication(event.origin, state);
        }
      });

      const checkClosed = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(checkClosed);
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
    const message = `UserID: ${state} has been synced with Discord!`;

    const backendUrl = `https://api.wortool.com/v2/discord/user/${state}`;

    this.discordService.getOne(state).subscribe((response) => {
      this.discordData = response;
      this.discordId = this.discordData.discordId;
      this.sharedDataService.currentUser.discordId = this.discordId;
      this.discordIsSynced = true;
      this.updateProfile();
      this.snackBar.open(message, "Close", {
        verticalPosition: "top",
        duration: 3000,
      });
    });
  }


  async updateProfile(alert: boolean = true) {
    try {
      await this.authService
      .profile(
        this.sharedDataService.currentUser.id,
        this.sharedDataService.currentUser.email,
        this.sharedDataService.currentUser.avatar_url,
        this.sharedDataService.currentUser.discordId,
        this.sharedDataService.currentUser.regimentId
      )
      .toPromise();

        if (alert){
          this.showSnackBar("Profile updated successfully!");
        }
      
      this.stillSelecting = false;

      const updatedUser = {
        ...this.sharedDataService.currentUser,
        email: this.sharedDataService.currentUser.email,
        avatar_url: this.sharedDataService.currentUser.avatar_url,
        discordId: this.sharedDataService.currentUser.discordId,
        regimentId: this.sharedDataService.currentUser.regimentId,
      };

      this.token.saveUser(updatedUser);

      if (this.sharedDataService.currentUser.regimentId != null) {
        const selectedRegiment = this.allRegimentsList.find(
          (regiment: { id: any }) => regiment.id == this.sharedDataService.currentUser.regimentId
        );
        if (selectedRegiment) {
          this.sharedDataService.regiment = selectedRegiment;
          this.regimentSelected = true;
        } else {
          this.sharedDataService.regiment = null;
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


  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

}

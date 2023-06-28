import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../../_services/token-storage.service";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { DiscordService } from "src/app/_services/discord.service";
import { MatSnackBar, MatSnackBarDismiss } from "@angular/material/snack-bar";
import { ConfirmDeleteSnackbarComponent } from "../../confirm-delete-snackbar/confirm-delete-snackbar.component";
import { UserService } from "src/app/_services/user.service";

@Component({
  selector: "app-regiment-settings",
  templateUrl: "./regiment-settings.component.html",
  styleUrls: ["./regiment-settings.component.scss"],
})
export class RegimentSettingsComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showMod = false;

  isModerator = false;
  roles: string[] = [];

  regimentID: any;
  regimentData: any;
  regimentSelected = true;

  regiment: any;
  guild_id: any;
  guild_avatar: any;
  description: any;
  invite_link: any;
  website: any;
  side: any;

  regimentChannels: any;
  regimentUsers: any;

  targetChannel: any;
  webhook: any;

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      await this.authService
        .checkModeratorRole(userID, this.currentUser.regimentId)
        .toPromise()
        .then((response) => {
          this.showMod = response.access;
          if (this.currentUser.regimentId) {
            this.regimentID = this.currentUser.regimentId;
            this.getRegiment();
          }
        })
        .catch((error) => {
          if (error.status === 403) {
            this.regimentSelected = false;
          } else {
            console.error("Error:", error);
          }
        });
    }
  }


  async getRegiment(): Promise<void> {
    if (this.regimentID) {
      await this.regimentService
        .getRegiment(this.regimentID)
        .toPromise()
        .then((response) => {
          this.regimentData = response;
          this.getRegimentChannels(this.regimentData.guild_id);
          this.getRegimentUsers(this.regimentData.id);
          this.regimentSelected = true;
  
          this.regiment = this.regimentData.regiment;
          this.guild_id = this.regimentData.guild_id;
          this.guild_avatar = this.regimentData.guild_avatar;
          this.description = this.regimentData.description;
          this.invite_link = this.regimentData.invite_link;
          this.website = this.regimentData.website;
  
          setTimeout(() => {
            // Get the select element by its ID
            const selectElement = document.getElementById(
              "side-select"
            ) as HTMLSelectElement;
  
            // Set the index of the select box to the first option
            selectElement.selectedIndex = 0;
          }, 200);
        })
        .catch(() => {
          this.regimentSelected = false;
        });
    } else {
      this.regimentSelected = false;
    }
  }
  

  

  async getRegimentChannels(guildId: string): Promise<void> {
    if (this.regimentID) {
      await this.discordService
        .getGuildChannels(guildId)
        .toPromise()
        .then((response: any) => {
          this.regimentChannels = response.channels;
        });
    }
  }

  async getRegimentUsers(guildId: string): Promise<void> {
    if (this.regimentID) {
      await this.regimentService
        .getRegimentUsers(guildId)
        .toPromise()
        .then((response: any) => {
          console.log(response);
          this.regimentUsers = response;
          this.updateCurrentUserRoles();
        });
    }
  }

  updateCurrentUserRoles() {
    const matchedUser = this.regimentUsers.find(
      (user: { id: any }) => user.id === this.currentUser.id
    );
    if (matchedUser) {
      this.roles = matchedUser.roles;
      this.isModerator = this.roles.includes("ROLE_MODERATOR");
    }
  }

  async updateTargetChannel(selectedValue: string): Promise<void> {
    this.targetChannel = selectedValue;

    setTimeout(async () => {
      await this.createWebhook(this.regimentData.guild_id, this.targetChannel);
    }, 300);
  }

  async createWebhook(guildId: string, channelId: string): Promise<void> {
    await this.discordService
      .createWebhook(guildId, channelId)
      .toPromise()
      .then((response: any) => {
        console.log(response);
        this.webhook = response;
        this.snackBar.open(
          `$Webhook created for channel ${this.targetChannel}!`,
          "Close",
          { duration: 3000 }
        );
        this.getRegiment();
      });
  }

  async updateRegiment() {
    if (this.regimentID) {
      await this.regimentService
        .updateRegiment(
          this.currentUser.id,
          this.regimentID,
          this.regiment,
          this.guild_id,
          this.guild_avatar,
          this.invite_link,
          this.website,
          this.description,
          this.side
        )
        .toPromise()
        .then((response) => {
          console.log(response);
          this.snackBar.open(`Regiment Information Updated`, "Close", {
            duration: 3000,
          });
          this.getRegiment();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  async syncDiscord() {
    const response = await fetch(
      `https://api.tonewebdesign.com/pa/discord/guild/${this.regimentData.guild_id}/get`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from endpoint. Status: ${response.status}`
      );
    }

    const data = await response.json();
    const discord = data.guild;

    this.regiment = discord.name;
    this.guild_avatar = discord.iconURL;
    this.guild_id = discord.id;
  }

  toggleModerator(userId: any) {
    const regimentId = this.regimentData.id;

    this.regimentService
      .getRegimentUsers(regimentId)
      .toPromise()
      .then((users) => {
        const matchedUser = users.find(
          (user: { id: any }) => user.id === userId
        );
        if (matchedUser) {
          const hasModeratorRole = matchedUser.roles.includes("ROLE_MODERATOR");

          if (hasModeratorRole) {
            this.confirmRemoveModerator(userId);
          } else {
            this.confirmAddModerator(userId);
          }
        } else {
          console.log("User not found.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  confirmAddModerator(userId: any) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to set this user as a Regiment Manager?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef
      .afterDismissed()
      .subscribe((dismissedAction: MatSnackBarDismiss) => {
        if (dismissedAction.dismissedByAction) {
          this.setModerator(userId);
        } else {
          console.log('User clicked "Cancel"');
          this.getRegimentUsers(this.regimentData.id);
        }
      });
  }

  confirmRemoveModerator(userId: any) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove this user as a Regiment Manager?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef
      .afterDismissed()
      .subscribe((dismissedAction: MatSnackBarDismiss) => {
        if (dismissedAction.dismissedByAction) {
          this.removeModerator(userId);
        } else {
          console.log('User clicked "Cancel"');
          this.getRegimentUsers(this.regimentData.id);
        }
      });
  }

  setModerator(userId: any) {
    this.regimentService
      .setModerator(userId)
      .toPromise()
      .then((response) => {
        console.log(response);
        const userIndex = this.regimentUsers.findIndex(
          (user: { id: any }) => user.id === userId
        );
        if (userIndex !== -1) {
          this.regimentUsers[userIndex].roles.push("ROLE_MODERATOR");
          this.isModerator = true;
          setTimeout(() => {
            this.getRegimentUsers(this.regimentData.id);
          }, 300);
          this.snackBar.open(`User set as Regiment Manager`, "Close", {
            duration: 3000,
            verticalPosition: "top",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error case, if needed
      });
  }

  removeModerator(userId: any) {
    this.regimentService
      .removeModerator(userId)
      .toPromise()
      .then((response) => {
        console.log(response);
        const userIndex = this.regimentUsers.findIndex(
          (user: { id: any }) => user.id === userId
        );
        if (userIndex !== -1) {
          const moderatorIndex =
            this.regimentUsers[userIndex].roles.indexOf("ROLE_MODERATOR");
          if (moderatorIndex !== -1) {
            this.regimentUsers[userIndex].roles.splice(moderatorIndex, 1);
          }
          this.isModerator = false;
          this.snackBar.open(`User removed as Regiment Manager`, "Close", {
            duration: 3000,
            verticalPosition: "top",
          });
          setTimeout(() => {
            this.getRegimentUsers(this.regimentData.id);
          }, 300);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error case, if needed
      });
  }

  confirmRemoveUser(userId: any) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove ${userId} your Regiment?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeUserFromRegiment(userId);
    });
  }

  removeUserFromRegiment(userId: any) {
    this.regimentService
      .removeUsersRegiment(userId)
      .toPromise()
      .then((response) => {
        console.log(response);
        this.getRegimentUsers(this.regimentData.id);
        this.token.saveUser(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

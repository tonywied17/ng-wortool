/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\regiment-settings\regiment-settings.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 1:12:44 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ViewEncapsulation } from "@angular/core";
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
  encapsulation: ViewEncapsulation.None
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

  isOwner: boolean = false;

  regimentChannels: any;
  regimentUsers: any;
  discordRegimentUsers: any;

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

  /**
   * @method ngOnInit
   */
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
            this.getRegiment().then(() => {
              this.getRegimentDiscordData();

              if(this.currentUser.discordId == this.regimentData.ownerId) {
                this.isOwner = true;
              }else{
                this.isOwner = false;
              }
            });
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

  /**
   * @method getRegiment
   * @description Get the regiment data from the database
   * @returns {Promise<void>}
   */
  async getRegiment(): Promise<void> {
    try {
      if (this.regimentID) {
        const response = await this.regimentService.getRegiment(this.regimentID).toPromise();
  
        if (response) {
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
            const selectElement = document.getElementById("side-select") as HTMLSelectElement;
            selectElement.selectedIndex = 0;
          }, 200);
        } else {
          throw new Error('Response is undefined');
        }
      } else {
        this.regimentSelected = false;
      }
    } catch (error) {
      console.error('Error fetching regiment data:', error);
      this.regimentSelected = false;
    }
  }
  

  /**
   * @method getRegimentDiscordData
   * @description Get the regiment data from Discord
   * @returns {Promise<void>}
   */
  async getRegimentDiscordData(): Promise<void> {
    if (this.guild_id) {
      await this.discordService
        .getRegimentGuild(this.guild_id)
        .toPromise()
        .then((response: any) => {
          if (response.guild.iconURL && this.guild_avatar !== response.guild.iconURL) {
            this.regimentData.guild_avatar = response.guild.iconURL;
            this.guild_avatar = response.guild.iconURL;
            this.updateRegiment();
          }
        });
    }
  }

  /**
   * @method getRegimentChannels
   * @description Get the regiment channels from Discord
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   */
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

  /**
   * @method getRegimentUsers
   * @description Get the regiment users from the database
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   */
  async getRegimentUsers(guildId: string): Promise<void> {
    if (this.regimentID) {
      await this.regimentService
        .getRegimentUsers(guildId)
        .toPromise()
        .then((response: any) => {
          this.regimentUsers = response;
          this.updateCurrentUserRoles();

          const promises = this.regimentUsers.map((user: any) => {
            if (user.discordId && user.avatar_url) {
              return this.getDiscordRegimentUsers(
                user.discordId,
                this.guild_id
              ).then((discordUser: any) => {
                if (
                  discordUser &&
                  discordUser.USER_SPECIFIC &&
                  discordUser.USER_SPECIFIC.DISCORD_AVATAR &&
                  user.avatar_url !== discordUser.USER_SPECIFIC.DISCORD_AVATAR
                ) {
                  user.avatar_url = discordUser.USER_SPECIFIC.DISCORD_AVATAR;
                  return this.authService
                    .profile(
                      user.id,
                      user.email,
                      discordUser.USER_SPECIFIC.DISCORD_AVATAR,
                      user.discordId,
                      user.regimentId
                    )
                    .toPromise()
                    .then(() => {
                      if (user.id === this.currentUser.id) {
                        this.currentUser.avatar_url =
                          discordUser.USER_SPECIFIC.DISCORD_AVATAR;
                      }
                      return user;
                    });
                } else {
                  return user;
                }
              });
            } else {
              return Promise.resolve(user);
            }
          });

          Promise.all(promises).then((updatedUsers) => {
            this.regimentUsers = updatedUsers;
          });
        });
    }
  }

  /**
   * @method getDiscordRegimentUsers
   * @description Get the regiment users from Discord
   * @returns {Promise<void>}
   * @param discordId - The Discord user ID
   * @param guildId - The Discord guild ID
   */
  async getDiscordRegimentUsers(discordId: any, guildId: string): Promise<any> {
    return this.discordService
      .getUserGuildInfo(discordId, guildId)
      .toPromise()
      .then((response: any) => {
        // console.log(response);
        this.discordRegimentUsers = response;
        this.updateCurrentUserRoles();
        return response;
      });
  }

  /**
   * @method updateCurrentUserRoles
   * @description Update the current user roles
   * @returns {void}
   */
  updateCurrentUserRoles() {
    const matchedUser = this.regimentUsers.find(
      (user: { id: any }) => user.id === this.currentUser.id
    );
    if (matchedUser) {
      this.roles = matchedUser.roles;
      this.isModerator = this.roles.includes("ROLE_MODERATOR");
    }
  }

  /**
   * @method updateTargetChannel
   * @description Update the target channel
   * @returns {Promise<void>}
   * @param selectedValue - The selected channel value
   */
  async updateTargetChannel(selectedValue: string): Promise<void> {
    this.targetChannel = selectedValue;

    setTimeout(async () => {
      await this.createWebhook(this.regimentData.guild_id, this.targetChannel);
    }, 300);
  }

  /**
   * @method createWebhook
   * @description Create a webhook
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   * @param channelId - The Discord channel ID
   */
  async createWebhook(guildId: string, channelId: string): Promise<void> {
    await this.discordService
      .createWebhook(guildId, channelId)
      .toPromise()
      .then((response: any) => {
        // console.log(response);
        this.webhook = response;
        this.snackBar.open(
          `$Webhook created for channel ${this.targetChannel}!`,
          "Close",
          { duration: 3000 }
        );
        this.getRegiment();
      });
  }

  /**
   * @method updateRegiment
   * @description Update the regiment
   * @returns {Promise<void>}
   * @param regiment - The regiment name
   * @param guild_id - The Discord guild ID
   * @param guild_avatar - The Discord guild avatar
   * @param invite_link - The Discord invite link
   * @param website - The regiment website
   * @param description - The regiment description
   * @param side - The regiment side
   */
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

  /**
   * @method toggleModerator
   * @description Toggle the moderator
   * @returns {void}
   * @param userId - The user ID
   */
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

  /**
   * @method confirmAddModerator
   * @description Confirm add moderator
   * @returns {void}
   * @param userId - The user ID
   */
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
          this.getRegimentUsers(this.regimentData.id);
        }
      });
  }

  /**
   * @method confirmRemoveModerator
   * @description Confirm remove moderator
   * @returns {void}
   * @param userId - The user ID
   */
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
          this.getRegimentUsers(this.regimentData.id);
        }
      });
  }

  /**
   * @method setModerator
   * @description Set the moderator
   * @returns {void}
   * @param userId - The user ID
   */
  setModerator(userId: any) {
    this.regimentService
      .setModerator(userId, this.currentUser.id)
      .toPromise()
      .then((response) => {
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
      });
  }

  /**
   * @method removeModerator
   * @description Remove the moderator
   * @returns {void}
   * @param userId - The user ID
   */
  removeModerator(userId: any) {
    this.regimentService
      .removeModerator(userId, this.currentUser.id)
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
      });
  }

  /**
   * @method confirmRemoveUser
   * @description Confirm remove user
   * @returns {void}
   * @param userId - The user ID
   */
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

  /**
   * @method removeUserFromRegiment
   * @description Remove the user from the regiment
   * @returns {void}
   * @param userId - The user ID
   */
  removeUserFromRegiment(userId: any) {
    this.regimentService
      .removeUsersRegiment(userId)
      .toPromise()
      .then((response) => {
        // console.log(response);
        this.getRegimentUsers(this.regimentData.id);
        this.token.saveUser(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { SharedDataService } from "src/app/_services/shared-data.service";
import { RegimentService } from "src/app/_services/regiment.service";
import { MatSnackBar, MatSnackBarDismiss } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from 'src/app/_components/confirm-cancel-snackbar/confirm-cancel-snackbar.component';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  regimentUsers: any;
  discordRegimentUsers: any;
  isModerator: boolean = false;


  constructor(
    private snackBar: MatSnackBar,
    private regimentService: RegimentService,
    public sharedDataService: SharedDataService
  ) {

  }

  async ngOnInit(): Promise<void> {
    await this.getRegimentUsers(this.sharedDataService.regimentId)
  }

  /**
   * @method getRegimentUsers
   * @description Get the regiment users from the database
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   */
  async getRegimentUsers(guildId: number): Promise<void> {
    if (this.sharedDataService.regimentId) {
      await this.regimentService
        .getRegimentUsers(guildId)
        .toPromise()
        .then((response: any) => {
          this.regimentUsers = response;
          const promises = this.regimentUsers.map((user: any) => {
            if (user.avatar_url) {
              return Promise.resolve(user);
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
   * @method confirmAddModerator
   * @description Confirm add moderator
   * @returns {void}
   * @param userId - The user ID
   */
  confirmAddModerator(userId: any): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
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
          this.getRegimentUsers(this.sharedDataService.regimentId);
        }
      });
  }

  /**
   * @method confirmRemoveModerator
   * @description Confirm remove moderator
   * @returns {void}
   * @param userId - The user ID
   */
  confirmRemoveModerator(userId: any): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
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
          this.getRegimentUsers(this.sharedDataService.regimentId);
        }
      });
  }

  /**
   * @method setModerator
   * @description Set the moderator
   * @returns {void}
   * @param userId - The user ID
   */
  setModerator(userId: any): void {
    this.regimentService
      .setModerator(userId, this.sharedDataService.currentUser.id)
      .toPromise()
      .then((response) => {
        const userIndex = this.regimentUsers.findIndex(
          (user: { id: any }) => user.id === userId
        );
        if (userIndex !== -1) {
          this.regimentUsers[userIndex].roles.push("ROLE_MODERATOR");
          this.isModerator = true;
          setTimeout(() => {
            this.getRegimentUsers(this.sharedDataService.regimentId);
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
  removeModerator(userId: any): void {
    this.regimentService
      .removeModerator(userId, this.sharedDataService.currentUser.id)
      .toPromise()
      .then((response) => {
        // console.log(response);
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
            this.getRegimentUsers(this.sharedDataService.regimentId);
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
  confirmRemoveUser(userId: any): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
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
  removeUserFromRegiment(userId: any): void {
    this.regimentService
      .removeUsersRegiment(userId)
      .toPromise()
      .then((response) => {
        this.getRegimentUsers(this.sharedDataService.regimentId);
        this.sharedDataService.token.saveUser(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  /**
   * Check if regiment has members
   * @returns boolean
   */
  hasMembers(): boolean {
    if (this.regimentUsers) {
      return this.regimentUsers.some((user: { discordId: string; roles: string | string[]; }) => {
        return user.discordId !== this.sharedDataService.regiment.ownerId && !user.roles.includes('ROLE_MODERATOR');
      });
    }
    return false;
  }


}

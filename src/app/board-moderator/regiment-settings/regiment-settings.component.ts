/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\regiment-settings\regiment-settings.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 7:32:11 
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
import { MatDatepickerModule } from "@angular/material/datepicker";

interface Schedule {
  id: number;
  schedule_name: string;
  region_tz: string;
  regimentId: number;
  day: string;
  time: string;
  time24: string;
  time12: string;
  event_type: string;
  event_name: string | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: "app-regiment-settings",
  templateUrl: "./regiment-settings.component.html",
  styleUrls: ["./regiment-settings.component.scss"],
  encapsulation: ViewEncapsulation.None,
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

  display12HourTime: boolean = true;
  timeString: string = "24hr time";

  targetChannel: any;
  webhook: any;

  objectKeys = Object.keys;
  scheduleNames: { [key: string]: Schedule[] } = {};
  selectedScheduleName: string | null = null;
  creatingSchedule: boolean = false;

  scheduleForm = {
    schedule_name: "",
    region: "",
    day: "",
    time: "",
    event_type: "",
    event_name: "",
  };

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private matDatepicker: MatDatepickerModule
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
              if (this.currentUser.discordId == this.regimentData.ownerId) {
                this.isOwner = true;
              } else {
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

    this.getSchedules();
  }

  /**
   * @method getRegiment
   * @description Get the regiment data from the database
   * @returns {Promise<void>}
   */
  async getRegiment(): Promise<void> {
    try {
      if (this.regimentID) {
        const response = await this.regimentService
          .getRegiment(this.regimentID)
          .toPromise();

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
            const selectElement = document.getElementById(
              "side-select"
            ) as HTMLSelectElement;
            selectElement.selectedIndex = 0;
          }, 200);
        } else {
          throw new Error("Response is undefined");
        }
      } else {
        this.regimentSelected = false;
      }
    } catch (error) {
      console.error("Error fetching regiment data:", error);
      this.regimentSelected = false;
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
  async updateRegiment(): Promise<void> {
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
   * @method confirmAddModerator
   * @description Confirm add moderator
   * @returns {void}
   * @param userId - The user ID
   */
  confirmAddModerator(userId: any): void {
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
  confirmRemoveModerator(userId: any): void {
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
  setModerator(userId: any): void {
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
  removeModerator(userId: any): void {
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
  confirmRemoveUser(userId: any): void {
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
  removeUserFromRegiment(userId: any): void {
    this.regimentService
      .removeUsersRegiment(userId)
      .toPromise()
      .then((response) => {
        this.getRegimentUsers(this.regimentData.id);
        this.token.saveUser(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  /**
   * @method sortSchedules
   * @description Sort the schedules
   * @param schedules - The schedules
   * @returns - The sorted schedules
   */
  sortSchedules(schedules: Schedule[]): Schedule[] {
    const dayOrder: { [day: string]: number } = { 
      'Monday': 0, 
      'Tuesday': 1, 
      'Wednesday': 2, 
      'Thursday': 3, 
      'Friday': 4, 
      'Saturday': 5, 
      'Sunday': 6 
    };
    

    return schedules.sort((a, b) => {
      // Map days to their order in the week and then sort
      const dayA = dayOrder[a.day];
      const dayB = dayOrder[b.day];

      if(dayA < dayB) return -1;
      if(dayA > dayB) return 1;
  
      // If days are equal, sort by time
      const timeA = this.getTimeInMinutes(a.time);
      const timeB = this.getTimeInMinutes(b.time);
  
      if(timeA < timeB) return -1;
      if(timeA > timeB) return 1;
  
      return 0;
    });
}


  /**
   * @method getTimeInMinutes
   * @description Get the time in minutes
   * @param time - The time
   * @returns - The time in minutes
   */
  getTimeInMinutes(time: string): number {
    let [hour, minute] = time.split(":");
    let hours = parseInt(hour);
    let minutes = parseInt(minute);

    return hours * 60 + minutes;
  }

  /**
   * @method trimLeadingZero
   * @description Trim the leading zero
   * @param time - The time
   * @returns - The time with leading zero trimmed
   */
  trimLeadingZero(time: string): string {
    if (time.startsWith("0")) {
      return time.slice(1);
    }
    return time;
  }

  /**
   * @method getSchedules
   * @description Get the schedules
   * @returns {void}
   * @param regimentID - The regiment ID
   * @param userID - The user ID
   * @param scheduleName - The schedule name
   * @param day - The day
   * @param time - The time
   */
  getSchedules(): void {
    this.regimentService.getSchedulesByRegiment(this.currentUser.id, this.regimentID).subscribe((response: Schedule[]) => {
      response = this.sortSchedules(response);
    
      response.forEach(schedule => {
        const scheduleName = schedule.schedule_name || 'null'; 
    
        if(!this.scheduleNames[scheduleName]) {
          this.scheduleNames[scheduleName] = [];
        }
  
        schedule.time24 = schedule.time;
        schedule.time12 = this.convertTo12Hour(schedule.time);
    
        this.scheduleNames[scheduleName].push(schedule);
      });
    });
  }

  /**
   * @method createSchedule
   * @description Create the schedule
   * @returns {void}
   */
  createSchedule(): void {
    this.selectedScheduleName = null;
    this.creatingSchedule = true;

    this.regimentService
      .createSchedule(
        this.currentUser.id,
        this.scheduleForm.schedule_name,
        this.scheduleForm.region,
        this.regimentID,
        this.scheduleForm.day,
        this.scheduleForm.time,  
        this.scheduleForm.event_type,
        this.scheduleForm.event_name
      )
      .subscribe((response) => {
        console.log(response);
        this.scheduleNames = {};
        this.getSchedules(); 

        this.creatingSchedule = false;
        this.selectedScheduleName = this.scheduleForm.schedule_name;
        
        this.scheduleForm = {
          schedule_name: '',
          region: '',
          day: '',
          time: '',
          event_type: '',
          event_name: ''
        };
      });
  }

  /**
   * @method addDay
   * @description - Add the day
   * @returns {void}
   * @returns - The time in minutes
   */
  addDay(): void {
    if(this.selectedScheduleName === null) {
      // Handle the case when no schedule is selected, for example:
      alert("Please select a schedule before adding a day");
      return;
    }
  
    this.regimentService
      .createSchedule(
        this.currentUser.id,
        this.selectedScheduleName, // replaced this.scheduleForm.schedule_name with this.selectedScheduleName
        this.scheduleForm.region,
        this.regimentID,
        this.scheduleForm.day,
        this.scheduleForm.time,  
        this.scheduleForm.event_type,
        this.scheduleForm.event_name
      )
      .subscribe((response) => {
        console.log(response);
        // Reset the scheduleNames before fetching the updated list of schedules
        this.scheduleNames = {};
        this.getSchedules(); 
      });
  }

  /**
   * @method deleteSchedule
   * @description Delete the schedule
   * @returns {void}
   * @param scheduleId - The schedule ID
   */
  removeDay(scheduleId: number): void {
    this.regimentService.removeSchedule(this.currentUser.id, this.regimentID, scheduleId).subscribe((response) => {
      console.log(response);
      this.scheduleNames = {};
      this.getSchedules();

      let totalEntries = 0;
      for (let scheduleName in this.scheduleNames) {
        totalEntries += this.scheduleNames[scheduleName].length;
      }

      if (totalEntries === 0) {
        this.scheduleForm = { 
          schedule_name: '',
          region: '',
          day: '',
          time: '',
          event_type: '',
          event_name: '',
        };
        this.display12HourTime = true; 
        this.selectedScheduleName = null; 
      }
    });
  }
  
  /**
   * @method toggleTimeFormat
   * @description Toggle the time format
   * @returns {void}
   */
  toggleTimeFormat(): void {
    this.display12HourTime = !this.display12HourTime;
    if(this.display12HourTime) {
      this.timeString = "24hr time";
    } else {
      this.timeString = "12hr time";
    }
  }

  /**
   * @method convertTo12Hour
   * @description Convert the time to 12 hour format
   * @returns - The time in 12 hour format
   * @param time24 - The time in 24 hour format
   */
  convertTo12Hour(time24: string): string {
    let [hour, minute] = time24.split(":");
    let hours = parseInt(hour);
    let minutes = parseInt(minute);

    let period = hours >= 12 ? "PM" : "AM";

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    let minuteStr =
      minutes < 10 ? "0" + minutes.toString() : minutes.toString();

    return `${hours}:${minuteStr} ${period}`;
  }

  /**
   * @method selectSchedule
   * @description Select the schedule
   * @returns {void}
   * @param scheduleName - The schedule name
   */
  selectSchedule(scheduleName: string): void {
    this.selectedScheduleName = scheduleName;
  }
  
}

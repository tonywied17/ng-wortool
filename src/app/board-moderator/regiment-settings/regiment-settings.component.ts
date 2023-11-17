/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\regiment-settings\regiment-settings.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri November 17th 2023 3:41:16 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, ElementRef, NgZone, ViewChild, OnDestroy, TemplateRef } from "@angular/core";
import { DiscordService } from "src/app/_services/discord.service";
import { SteamApiService } from "../../_services/steam-api.service";
import { MatSnackBar, MatSnackBarDismiss } from "@angular/material/snack-bar";
import { ConfirmDeleteSnackbarComponent } from "../../confirm-delete-snackbar/confirm-delete-snackbar.component";
import { FileService } from 'src/app/_services/file.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TabSelectionService } from "src/app/_services/tab-selection.service";
import { MatTabGroup } from '@angular/material/tabs';
import { MapImageComponent } from "src/app/map-image/map-image.component"; 
import { MatDialog } from "@angular/material/dialog";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { RegimentService } from "src/app/_services/regiment.service";

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
export class RegimentSettingsComponent implements OnInit, OnDestroy {
  @ViewChild("dialogTemplate")
  _dialogTemplate!: TemplateRef<any>;
  content?: string;
  isLoaded: boolean = false;
  roles: string[] = [];
  regimentSelected = true;
  regimentChannels: any;
  regimentUsers: any;
  discordRegimentUsers: any;

  display12HourTime: boolean = true;
  timeString: string = "24hr time";

  targetChannel: any;
  webhook: any;

  objectKeys = Object.keys;
  scheduleNames: { [key: string]: Schedule[] } = {};
  scheduleCount: number = 0;
  scheduleCounts: { [key: string]: number } = {};
  selectedScheduleName: string | null = null;
  creatingSchedule: boolean = false;
  editingSchedule: boolean = false;
  lastDayRemoved = false

  scheduleForm = {
    schedule_name: "",
    region: "",
    day: "",
    time: "",
    event_type: "",
    event_name: "",
  };

  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';

  screenshots: any;
  randomScreenshot: string = "";
  gameDetails: any;

  selectedCover?: FileList;
  currentCover?: File;
  progressCover = 0;
  messageCover = '';

  fileInfos: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  coverInfos?: Observable<any>;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  private tabGroupSubscription: { unsubscribe: () => void } | null = null;
  isModerator: boolean = false;
  currentUser: any;
  token: any;

  constructor(
    private discordService: DiscordService,
    private steamApiService: SteamApiService,
    private snackBar: MatSnackBar,
    private uploadService: FileService,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private tabSelectionService: TabSelectionService,
    private dialog: MatDialog,
    private regimentService: RegimentService,
    public sharedDataService: SharedDataService
  ) {
    this.tabGroupSubscription = this.tabSelectionService.selectedTabIndex$.subscribe((index) => {
      console.log('Selected Index:', index);
      this.tabGroup.selectedIndex = index;
    });
  }

  /**
   * @method ngOnInit
   */
  async ngOnInit(): Promise<void> {

    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      // Processed
      this.isLoaded = true
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });

    await this.getScreenshots();
    this.getSchedules();
    this.getRegiment();
    this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
      (files: any[]) => {
        this.fileInfos.next(files);
      },
      (error) => {
        console.error("Error getting files:", error);
      }
    );

    this.tabSelectionService.selectedTabIndex$.subscribe((index) => {
      console.log('Selected Index:', index);
      this.tabGroup.selectedIndex = index;
    });

    console.log(this.regimentUsers)
  }

  /**
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.tabSelectionService.clearSelectedTabIndex();
  }



  /**
   * @method getRegiment
   * @description Get the regiment data from the database
   * @returns {Promise<void>}
   */
  async getRegiment(): Promise<void> {
    await this.getRegimentChannels(this.sharedDataService.regiment.guild_id);
    await this.getRegimentUsers(this.sharedDataService.regimentId);
    this.regimentSelected = true;
  }

  /**
   * @method getRegimentChannels
   * @description Get the regiment channels from Discord
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   */
  async getRegimentChannels(guildId: string): Promise<void> {
    if (this.sharedDataService.regimentId) {
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
   * @method updateTargetChannel
   * @description Update the target channel
   * @returns {Promise<void>}
   * @param selectedValue - The selected channel value
   */
  async updateTargetChannel(selectedValue: string): Promise<void> {
    this.targetChannel = selectedValue;

    setTimeout(async () => {
      await this.createWebhook(this.sharedDataService.regiment.guild_id, this.targetChannel);
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
        // // console.log(response);
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
    if (this.sharedDataService.regimentId) {
      await this.regimentService
        .updateRegiment(
          this.sharedDataService.currentUser.id,
          this.sharedDataService.regimentId,
          this.sharedDataService.regiment.regiment,
          this.sharedDataService.regiment.guild_id,
          this.sharedDataService.regiment.guild_avatar,
          this.sharedDataService.regiment.invite_link,
          this.sharedDataService.regiment.website,
          this.sharedDataService.regiment.youtube,
          this.sharedDataService.regiment.description,
          this.sharedDataService.regiment.side
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
        this.getRegimentUsers(this.sharedDataService.regimentId);
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
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    return schedules.sort((a, b) => {
      // Map days to their order in the week and then sort
      const dayA = dayOrder[a.day];
      const dayB = dayOrder[b.day];

      if (dayA < dayB) return -1;
      if (dayA > dayB) return 1;

      // If days are equal, sort by time
      const timeA = this.getTimeInMinutes(a.time);
      const timeB = this.getTimeInMinutes(b.time);

      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;

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
   * @param this.sharedDataService.regimentId - The regiment ID
   * @param userID - The user ID
   * @param scheduleName - The schedule name
   * @param day - The day
   * @param time - The time
   */
  async getSchedules(): Promise<void> {
    let response: Schedule[] = await this.regimentService.getSchedulesByRegiment(this.sharedDataService.currentUser.id, this.sharedDataService.regimentId).toPromise();
    response = this.sortSchedules(response);


    this.scheduleCounts = {};
    this.scheduleCount = response.length;

    response.forEach((schedule) => {
      const scheduleName = schedule.schedule_name || "null";

      if (!this.scheduleNames[scheduleName]) {
        this.scheduleNames[scheduleName] = [];
      }

      schedule.time24 = schedule.time;
      schedule.time12 = this.convertTo12Hour(schedule.time);

      this.scheduleNames[scheduleName].push(schedule);

      if (!this.scheduleCounts[scheduleName]) {
        this.scheduleCounts[scheduleName] = 1;
      } else {
        this.scheduleCounts[scheduleName]++;
      }
    });

    // Check if the selected schedule still has any days after the removal
    if (this.lastDayRemoved && (!this.selectedScheduleName || !this.scheduleNames[this.selectedScheduleName] || this.scheduleNames[this.selectedScheduleName].length === 0)) {
      this.scheduleForm = { // Reset form
        schedule_name: '',
        region: '',
        day: '',
        time: '',
        event_type: '',
        event_name: '',
      };
      this.display12HourTime = true; // reset the time format
      this.selectedScheduleName = null; // reset the selected schedule name
      this.editingSchedule = false; // Hide the edit schedule div
      this.lastDayRemoved = false; // Reset the flag
    }
  }

  filterSchedulesByDay(day: string) {
    if (this.selectedScheduleName) {
      return this.scheduleNames[this.selectedScheduleName].filter(schedule => schedule.day === day);
    }
    return [];
  }

  /**
   * @method createSchedule
   * @description Create the schedule
   * @returns {void}
   */
  createSchedule(): void {
    this.selectedScheduleName = null;
    this.editingSchedule = false;
    this.creatingSchedule = true;

    this.regimentService
      .createSchedule(
        this.sharedDataService.currentUser.id,
        this.scheduleForm.schedule_name,
        this.scheduleForm.region,
        this.sharedDataService.regimentId,
        this.scheduleForm.day,
        this.scheduleForm.time,
        this.scheduleForm.event_type,
        this.scheduleForm.event_name
      )
      .subscribe((response) => {
        // console.log(response);
        this.scheduleNames = {};
        this.getSchedules();

        this.creatingSchedule = false;
        this.selectedScheduleName = this.scheduleForm.schedule_name;
        this.editingSchedule = true;

        this.scheduleForm = {
          schedule_name: "",
          region: "",
          day: "",
          time: "",
          event_type: "",
          event_name: "",
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
    if (this.selectedScheduleName === null) {
      // Handle the case when no schedule is selected, for example:
      alert("Please select a schedule before adding a day");
      return;
    }

    this.regimentService
      .createSchedule(
        this.sharedDataService.currentUser.id,
        this.selectedScheduleName, // replaced this.scheduleForm.schedule_name with this.selectedScheduleName
        this.scheduleForm.region,
        this.sharedDataService.regimentId,
        this.scheduleForm.day,
        this.scheduleForm.time,
        this.scheduleForm.event_type,
        this.scheduleForm.event_name
      )
      .subscribe((response) => {
        // console.log(response);
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
  async removeDay(scheduleId: number): Promise<void> {
    const response = await this.regimentService.removeSchedule(this.sharedDataService.currentUser.id, this.sharedDataService.regimentId, scheduleId).toPromise();
    // console.log(response);

    if (this.selectedScheduleName && this.scheduleNames[this.selectedScheduleName] && this.scheduleNames[this.selectedScheduleName].length === 1) {
      this.lastDayRemoved = true;
    }

    this.scheduleNames = {};
    await this.getSchedules();
  }

  /**
   * @method toggleTimeFormat
   * @description Toggle the time format
   * @returns {void}
   */
  toggleTimeFormat(): void {
    this.display12HourTime = !this.display12HourTime;
    if (this.display12HourTime) {
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
    this.editingSchedule = true;
  }

  /**
   * @method editSchedule
   * @description Edit the schedule
   * @returns {void}
   * @param scheduleId - The schedule ID
   */
  cancelEdit(): void {
    this.editingSchedule = false;
    this.selectedScheduleName = null;
    this.creatingSchedule = false;
    this.scheduleForm = {
      schedule_name: "",
      region: "",
      day: "",
      time: "",
      event_type: "",
      event_name: "",
    };
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

  /**
   * Select regular media file input
   * @param event 
   */
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  /**
   * Select cover file input
   * @param event 
   */
  selectCover(event: any): void {
    this.selectedCover = event.target.files;
  }

  /**
   * Upload regular media files
   */
  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.uploadService.upload(this.currentFile, this.sharedDataService.regimentId).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.snackBar.open(event.body.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
              this.currentFile = undefined;
              // Update fileInfos using next method of BehaviorSubject
              this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
                (files: any[]) => {
                  this.fileInfos.next(files);
                },
                (error: any) => {
                  console.error("Error getting files:", error);
                }
              );
            }
          },
          error: (err: any) => {
            console.log(err);
            this.progress = 0;

            if (err.error && err.error.message) {
              this.snackBar.open(err.error.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            } else {
              this.snackBar.open("Could not upload the file! Images Only, 10MB Per Limit", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            }

            this.currentFile = undefined;
          },
        });
      }

      this.selectedFiles = undefined;
    }
  }

  /**
   * Upload Cover Photo
   */
  uploadCover(): void {
    this.progressCover = 0;

    if (this.selectedCover) {
      const file: File | null = this.selectedCover.item(0);

      if (file) {
        this.currentCover = file;

        this.uploadService.uploadCover(this.currentCover, this.sharedDataService.regimentId).subscribe({
          next: async (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progressCover = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.coverInfos = await firstValueFrom(this.uploadService.getCover(this.sharedDataService.regimentId));
              if (Array.isArray(this.coverInfos) && this.coverInfos.length > 0) {
                const coverUrl = this.coverInfos[0].url;
                this.sharedDataService.regiment.cover_photo = coverUrl
                console.log('Cover URL:', coverUrl);
              } else {
                console.error('Invalid coverInfos array or empty array.');
              }
              this.getRegiment();
              this.currentCover = undefined;
              this.snackBar.open("Your cover photo has been updated.", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });

            }
          },
          error: (err: any) => {
            console.log(err);
            this.progressCover = 0;
            if (err.error && err.error.message) {
              this.snackBar.open(err.error.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            } else {
              this.snackBar.open("Could not upload the file! Images Only, 10MB Per Limit", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            }

            this.currentCover = undefined;
          },
        });
      }

      this.selectedCover = undefined;
    }
  }

  /**
   * Snackbar confirmation for regular media deletion
   * @param file 
   */
  confirmRemoveFile(file: any): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove this file?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeFile(file);
    });
  }

  /**
   * Removes the file after confirmation
   * @param file 
   */
  removeFile(file: any) {
    this.uploadService.remove(this.sharedDataService.regimentId, file).subscribe(
      () => {
        const currentFileInfos = this.fileInfos.value;
        const updatedFileInfos = currentFileInfos.filter((f) => f.name !== file.name);
        this.fileInfos.next(updatedFileInfos);

        this.ngZone.run(() => {
          this.snackBar.open("File removed", "Close", {
            verticalPosition: "top",
            duration: 3000,
          });
        });

        this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
          (files: any[]) => {
            this.fileInfos.next(files);
          },
          (error) => {
            console.error("Error getting files:", error);
          }
        );

        this.selectedFiles = undefined;


      },
      (error) => {
        // Handle error if needed
        console.error("Error removing file:", error);
      }
    );
  }

  /**
   * Snackbar confirmation for regular media deletion
   * @param file 
   */
  confirmRemoveCover(fileUrl: string): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to use random screenshots as your cover? This will delete your current cover photo.`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeCover(fileUrl);
    });
  }

  /**
   * Remove Cover Photo
   * @param fileUrl 
   */
  removeCover(fileUrl: string) {
    const prefixToRemove = 'https://api.tonewebdesign.com/pa/regiments/9/files/cover/';

    if (fileUrl.startsWith(prefixToRemove)) {
      const fileName = fileUrl.substring(prefixToRemove.length);


      this.uploadService.removeCover(this.sharedDataService.regimentId, fileName).subscribe(
        () => {
          this.ngZone.run(() => {
            this.snackBar.open('File removed', 'Close', {
              verticalPosition: 'top',
              duration: 3000,
            });
          });

          this.selectedCover = undefined;
          this.getRegiment();
          this.sharedDataService.regiment.cover_photo = undefined;

        },
        (error) => {
          console.error('Error removing file:', error);
        }
      );
    } else {
      console.error('Invalid file URL:', fileUrl);
    }
  }

  /**
   * Detect file input changes for regular media upload field
   * @param event 
   */
  fileInputChange(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        this.selectedFiles = event.target.files;
        this.message = "";
      } else {
        this.message = 'Please select an image file only.';
        this.clearFileInput();
      }
    }
  }

  coverInputChange(event: any) {
    const selectedCover = event.target.files[0];

    if (selectedCover) {
      if (selectedCover.type.startsWith('image/')) {
        this.selectedCover = event.target.files;
        this.messageCover = "";
      } else {
        this.messageCover = 'Please select an image file only.';
        this.clearCoverInput();
      }
    }
  }

  clearFileInput() {
    const fileInput = this.elementRef.nativeElement.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearCoverInput() {
    const coverInput = this.elementRef.nativeElement.querySelector('#coverInput');
    if (coverInput) {
      coverInput.value = '';
    }
  }

  /**
   * Get screenshots
   * This function is used to get the screenshots for the game from steam api
   * @returns - promise
   */
  async getScreenshots(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.steamApiService.getAppDetails().subscribe(
        (data) => {
          this.gameDetails = data;
          this.screenshots = this.gameDetails.screenshots;
          this.randomScreenshot = this.getRandomScreenshot(this.screenshots);
          resolve();
        },
        (error) => {
          // handle error if needed
          reject(error);
        }
      );
    });
  }

  /**
   * Get random screenshot
   * This function is used to get a random screenshot from the screenshots array
   * @param screenshots - screenshots array
   * @returns - random screenshot url path
   */
  getRandomScreenshot(screenshots: any[]): string {
    if (screenshots && screenshots.length > 0) {
      const randomIndex = Math.floor(Math.random() * screenshots.length);
      return screenshots[randomIndex].path_full;
    }
    return "";
  }

  openImageModal(imageUrl: string): void {
    this.dialog.open(MapImageComponent, {
      data: { imageUrl },
    });
  }

}



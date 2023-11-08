/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiment-info\regiment-info.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 7th 2023 5:45:58 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { RegimentService } from "../../_services/regiment.service";
import { SteamApiService } from "../../_services/steam-api.service";
import { Location } from "@angular/common";
import { firstValueFrom, Observable } from "rxjs";
import { FileService } from 'src/app/_services/file.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';



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
  selector: "app-regiment-info",
  templateUrl: "./regiment-info.component.html",
  styleUrls: ["./regiment-info.component.scss"],
})
export class RegimentInfoComponent implements OnInit {
  regiment: any;
  regimentUsers: any;
  regimentID: any;
  screenshots: any;
  randomScreenshot: string = "";
  gameDetails: any;
  isDataLoaded: boolean = false;

  display12HourTime: boolean = true;
  timeString: string = "24hr time";

  objectKeys = Object.keys;
  scheduleNames: { [name: string]: Schedule[] } = {};
  scheduleCount: number = 0;
  scheduleCounts: { [key: string]: number } = {};
  selectedScheduleName: string | null = null;

  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  fileInfos: any;
  currentPage: number = 1;
  itemsPerPage: number = 9;

  constructor(
    private route: ActivatedRoute,
    private regimentService: RegimentService,
    private steamApiService: SteamApiService,
    private location: Location,
    private uploadService: FileService,
    private dialog: MatDialog
  ) {
    this.regiment = {};
  }
  

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const id = params["id"];
      this.regimentID = id;
      this.retrieveInitialData();

    });
  }

  openImageModal(imageUrl: string) {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl,
        galleryImages: this.fileInfos // Pass the gallery images
      },
      panelClass: 'image-modal-dialog',
    });
  
    dialogRef.backdropClick().subscribe(() => dialogRef.close());
  }
  
  

  /**
   * Get regiment and regiment users on init
   */
  async retrieveInitialData(): Promise<void> {
    await Promise.all([
      this.getRegiment(this.regimentID),
      this.fetchRegimentUsers(),
      this.getScreenshots(),
      this.getSchedules(),
      this.getFileInfos()
      
    ]);

    this.isDataLoaded = true;
  }

  async getFileInfos() {
    this.uploadService.getFiles(this.regimentID)
      .subscribe((data: any) => {
        this.fileInfos = data;
      }, (error) => {
        
      });
  }

  getItemsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.fileInfos.slice(startIndex, endIndex);
  }

  get totalItems(): number {
    return this.fileInfos.length;
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

changePage(newPage: number): void {
  if (newPage >= 1 && newPage <= this.totalPages) {
    this.currentPage = newPage;
  }
}

getPagesArray(totalPages: number): number[] {
  return new Array(totalPages).fill(0).map((_, index) => index + 1);
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

  /**
   * Get regiment by id
   * @param id - regiment id
   */
  async getRegiment(id: any): Promise<void> {
    this.regiment = await firstValueFrom(this.regimentService.getRegiment(id));
  }

  /**
   * Get regiment users
   */
  async fetchRegimentUsers(): Promise<void> {
    this.regimentUsers = await firstValueFrom(
      this.regimentService.getRegimentUsers(this.regimentID)
    );
    this.regiment.members = this.regimentUsers;

    // console.log(this.regimentUsers)

    // console.log(`-- OWNERS --`);
    // this.regimentUsers.forEach((user: any) => {
    //   if (this.regiment.ownerId.includes(user.discordId)) {
    //       console.log(user.username);
    //   }
    // });

    // console.log(`-- MANAGERS --`);
    // this.regimentUsers.forEach((user: any) => {
    //   if ((!this.regiment.ownerId.includes(user.discordId)) && user.roles.includes('ROLE_MODERATOR')) {
    //       console.log(user.username);
    //   }
    // });

    // console.log(`-- MEMBERS --`);
    // this.regimentUsers.forEach((user: any) => {
    //   if ((!this.regiment.ownerId.includes(user.discordId)) && !user.roles.includes('ROLE_MODERATOR')) {
    //       console.log(user.username);
    //   }
    // });
  
  }

  /**
   * Open url in new tab
   * @param url - url to open
   */
  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

   /**
   * Go back
   * This function is used to go back to the previous page
   */
   goBack(): void {
    this.location.back();
  }


  /* Schedule Testing */
  getScheduleNames(): string[] {
    return Object.keys(this.scheduleNames);
  }

  
  async getSchedules(): Promise<void> {
    let response: Schedule[] = await this.regimentService.getSchedulesByRegiment(0, this.regimentID).toPromise();
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
  }
  


  filterSchedulesByDayAndName(day: string, name: string): Schedule[] {
    if (this.scheduleNames[name]) {
      return this.scheduleNames[name].filter((schedule) => schedule.day === day);
    }
    return [];
  }
  


  toggleTimeFormat(): void {
    this.display12HourTime = !this.display12HourTime;
    if (this.display12HourTime) {
      this.timeString = "24hr time";
    } else {
      this.timeString = "12hr time";
    }
  }


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

  getTimeInMinutes(time: string): number {
    let [hour, minute] = time.split(":");
    let hours = parseInt(hour);
    let minutes = parseInt(minute);

    return hours * 60 + minutes;
  }

  trimLeadingZero(time: string): string {
    if (time.startsWith("0")) {
      return time.slice(1);
    }
    return time;
  }

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

}

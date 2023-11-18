import { Component, OnInit } from '@angular/core';
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
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  objectKeys = Object.keys;
  scheduleNames: { [key: string]: Schedule[] } = {};
  scheduleCount: number = 0;
  scheduleCounts: { [key: string]: number } = {};
  selectedScheduleName: string | null = null;
  creatingSchedule: boolean = false;
  editingSchedule: boolean = false;
  lastDayRemoved = false
  display12HourTime: boolean = true;
  timeString: string = "24hr time";

  scheduleForm = {
    schedule_name: "",
    region: "",
    day: "",
    time: "",
    event_type: "",
    event_name: "",
  };

  constructor(
    private regimentService: RegimentService,
    public sharedDataService: SharedDataService
  ) {
  }


  ngOnInit(): void {
    this.getSchedules();
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


}

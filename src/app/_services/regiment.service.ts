/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\regiment.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun November 12th 2023 11:56:07 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

let API = "https://api.tonewebdesign.com/pa/regiments/";
let AUTH_API = "https://api.tonewebdesign.com/pa/auth/";


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class RegimentService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Get all regiments
   * This observable is used to get all regiments from the database
   * @returns {Observable<any>}
   */
  getRegiments(): Observable<any> {
    return this.http.get(API);
  }

  /**
   * Get regiment by id
   * This observable is used to get a regiment by id from the database
   * @param regimentId - number - the regiment id
   * @returns - Observable<any>
   */
  getRegiment(regimentId: number): Observable<any> {
    return this.http.get(API + regimentId);
  }

  /**
   * Get all the users in a regiment by regiment id
   * This observable is used to get all the users in a regiment by regiment id from the database
   * @param regimentId - number - the regiment id
   * @returns - Observable<any>
   */
  getRegimentUsers(regimentId: any): Observable<any> {
    return this.http.get(API + regimentId  + '/users');
  }

  /**
   * Update the regiment
   * This observable is used to update the regiment in the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param regiment - any - the regiment
   * @param guild_id - any - the guild id
   * @param guild_avatar - any - the guild avatar
   * @param invite_link - any - the invite link
   * @param website - any - the website
   * @param description - any - the description 
   * @param side - any - the side
   * @returns - Observable<any>
   */
  updateRegiment(userId: any, regimentId: number, regiment: any, guild_id: any, guild_avatar: any, invite_link: any, website: any, youtube: any, description: any, side: any): Observable<any> {
    
    return this.http.put(API + regimentId + '/update', {
      userId,
      regiment,
      guild_id,
      guild_avatar,
      invite_link,
      website,
      youtube,
      description,
      side,
    }, httpOptions);
  }

  /**
   * Sync the discord guild with the database
   * This observable is used to sync the discord guild with the database
   * @param requestedDomain - string - the requested domain
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param regiment - any - the regiment
   * @param guild_id - any - the guild id
   * @param guild_avatar - any - the guild avatar
   * @param invite_link - any - the invite link
   * @param website - any - the website
   * @param description - any - the description
   * @param side - any - the side
   * @returns - Observable<any>
   */
  syncRegiment(requestedDomain: string, userId: any, regimentId: number, regiment: any, guild_id: any, guild_avatar: any, invite_link: any, website: any, description: any, side: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-requested-domain': requestedDomain
    });
  
    const data = {
      userId,
      regiment,
      guild_id,
      guild_avatar,
      invite_link,
      website,
      description,
      side,
    };
  
    return this.http.put(API + regimentId + '/change', data, { headers });
  }

  /**
   * Remove the regiment
   * This observable is used to remove the regiment from the database
   * @param userId - number - the user id
   * @returns - Observable<any>
   */
  removeUsersRegiment(userId: number): Observable<any> {
    return this.http.delete(API + userId + '/remove');
  }

  /**
   * Set a regiment moderator
   * This observable is used to set a regiment moderator in the database
   * @param userId - number - the user id
   * @returns - Observable<any>
   */
  setModerator(memberId: number, userId: number): Observable<any> {
    return this.http.put(AUTH_API + memberId + '/setModerator', {
      userId
    }, httpOptions);
  }

  /**
   * Remove a regiment moderator
   * This observable is used to remove a regiment moderator in the database
   * @param userId - number - the user id
   * @returns - Observable<any>
   */
  removeModerator(memberId: number, userId: number): Observable<any> {
    return this.http.put(AUTH_API + memberId + '/removeModerator', {
      userId
    }, httpOptions);
  }

  /**
   * Get steam data for a regiment user by steam id
   * This observable is used to get steam data for a regiment user by steam id from the database
   * @param userId - number - the user id
   * @param steamId - number - the steam id
   * @returns - Observable<any>
   */
  getSteamId(userId: number, steamId: number): Observable<any> {
    return this.http.get(API + 'gameid/' + steamId);
  }

  /**
   * Get all game ids by regiment id
   * This observable is used to get all game ids by regiment id from the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @returns - Observable<any>
   */
  getGameIds(userId: number, regimentId: number): Observable<any> {
    return this.http.get(API + regimentId + '/gameids');
  }

  /**
   * Get steam data for a regiment user by game id (primary key id)
   * This observable is used to get steam data for a regiment user by game id (primary key id) from the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param gameId - number - the game id
   * @returns - Observable<any>
   */
  getGameId(userId: number, regimentId: number, gameId: number): Observable<any> {
    return this.http.get(API + regimentId + '/gameids/' + gameId);
  }

  /**
   * Add steam id to regiment database
   * This observable is used to add steam id to regiment database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param steamId - number - the steam id
   * @returns - Observable<any>
   */
  setGameId(userId: number, regimentId: number, steamId: number): Observable<any> {
    return this.http.post(API + regimentId + '/gameid', {
      steamId,
    }, httpOptions);
  }

  /**
   * Remove steam id from regiment database
   * This observable is used to remove steam id from regiment database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param day - string - the day
   * @returns - Observable<any>
   */
  getScheduleByDay(userId: number, regimentId: number, day: string): Observable<any> {
    return this.http.get(API + regimentId + '/schedules/' + day);
  }

  /**
   * Get all schedules by regiment id
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @returns - Observable<any>
   */
  getSchedulesByRegiment(userId: number, regimentId: number): Observable<any> {
    return this.http.get(API + regimentId + '/schedules');
  }

  /**
   * Get schedule by regiment id and region
   * This observable is used to get schedule by regiment id and region from the database
   * @param regimentId 
   * @param region 
   * @returns 
   */
  getScheduleByRegion(regimentId: number, region: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('region', region);

    return this.http.get(`${API}${regimentId}/schedules/region`, { params });
  }

  /**
   * Get schedule by regiment id and schedule name
   * This observable is used to get schedule by regiment id and schedule name from the database
   * @param regimentId - number - the regiment id
   * @param scheduleName - string - the schedule name
   * @returns - Observable<any>
   */
  getScheduleByName(regimentId: number, scheduleName: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('schedule_name', scheduleName);

    return this.http.get(`${API}${regimentId}/schedules/region`, { params });
  }

  /**
   * Get schedule by regiment id and schedule id
   * This observable is used to get schedule by regiment id and schedule id from the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param schedule_name - string - the schedule name
   * @param region_tz - string - the region time zone
   * @param day - string - the day
   * @param time - string - the time
   * @param event_type - string - the event type
   * @param event_name - string - the event name
   * @returns - Observable<any>
   */
  createSchedule(userId: number, schedule_name: string, region: string, regimentId: number, day: string, time: string, event_type: string, event_name: string): Observable<any> {
    return this.http.post(API + regimentId + '/schedules', {
      schedule_name,
      region,
      day,
      time,
      event_type,
      event_name
    }, httpOptions);
  }

  /**
   * Update schedule by regiment id and schedule id
   * This observable is used to update schedule by regiment id and schedule id from the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param scheduleId - number - the schedule id
   * @param schedule_name - string - the schedule name
   * @param region_tz - string - the region
   * @param day - string - the day
   * @param time - string - the time
   * @param event_type - string - the event type
   * @param event_name - string - the event name
   * @returns - Observable<any>
   */
  updateSchedule(userId: number, schedule_name: string, region_tz: string, regimentId: number, scheduleId: number, day: string, time: string, event_type: string, event_name: string): Observable<any> {
    return this.http.put(API + regimentId + '/schedules/' + scheduleId, {
      schedule_name,
      region_tz,
      day,
      time,
      event_type,
      event_name
    }, httpOptions);
  }

  /**
   * Remove schedule by regiment id and schedule id
   * This observable is used to remove schedule by regiment id and schedule id from the database
   * @param userId - number - the user id
   * @param regimentId - number - the regiment id
   * @param scheduleId - number - the schedule id
   * @returns - Observable<any>
   */
  removeSchedule(userId: number, regimentId: number, scheduleId: number): Observable<any> {
    return this.http.delete(API + regimentId + '/schedules/' + scheduleId);
  }

}

/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\discord.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri November 17th 2023 11:04:15 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


let API = "https://api.tonewebdesign.com/pa/discord";

@Injectable({
  providedIn: 'root'
})
export class DiscordService {

  constructor(
    private http: HttpClient
  ) { }


  /**
   * Get all users
   * This observable is used to get all discord users from the database
   * @returns {Observable<any>}
   */
  getAll(): Observable<any> {
    return this.http.get<any>(`${API}/users`);
  }

  /**
   * Get all users by a role name
   * @param guildId 
   * @param roleName 
   * @returns 
   */
  getUsersByRoles(guildId: string, roleName: string): Observable<any> {
    let params = new HttpParams().set('roleName', roleName);
    return this.http.get<any>(`${API}/guild/${guildId}/roles/users`, { params });
  }
  

  /**
   * Get one user
   * This observable is used to get one discord user from the database
   * @param userId - string - the discord user id
   * @returns {Observable<any>}
   */
  getOne(userId: string): Observable<any> {
    return this.http.get<any>(`${API}/user/${userId}`);
  }

  /**
   * Get all guilds
   * This observable is used to get the discord guild data from the database
   * @param guildId - string - the discord guild id
   * @returns {Observable<any>}
   */
  getRegimentGuild(guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/get`);
  }
  
  /**
   * Get all roles for a discord
   * @param guildId 
   * @returns 
   */
  getGuildRoles(guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/roles`);
  }

  /**
   * Get all guild channels
   * This observable is used to get the discord guild channels from the database
   * @param guildId - string - the discord guild id
   * @returns {Observable<any>}
   */
  getGuildChannels(guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/channels`);
  }

  /**
   * Get all discord user information from a guild
   * This observable is used to get the discord user information from a guild
   * @param discordId - string - the discord user id
   * @param guildId - string - the discord guild id
   * @returns {Observable<any>}
   */
  getUserGuildInfo(discordId: string, guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/user/${discordId}/get`);
  }

  /**
   * Create a webhook for a guild channel and return the webhook url
   * This observable is used to create a webhook for a guild channel and return the webhook url
   * @param guildId - string - the discord guild id
   * @param channelId - string - the discord channel id
   * @returns - Webhook url
   */
  createWebhook(guildId: string, channelId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/channel/${channelId}/webhook`);
  }

  /**
   * Remove a discord user from the database
   * This observable is used to remove a discord user from the database
   * @param userId - string - the discord user id
   * @returns {Observable<any>}
   */
  removeDiscordUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${API}/user/${userId}/remove`);
  }
  
}

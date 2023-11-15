/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\steam-api.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun November 12th 2023 8:49:57 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface SteamApiResponse {
  [key: string]: {
    data: any;
  };
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

interface SteamApiResponse2 {
  appnews: {
    appid: number;
    newsitems: NewsItem[];
  };
}

interface NewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

@Injectable({
  providedIn: 'root'
})


export class SteamApiService {

  constructor(private http: HttpClient) { }

  /**
   * Get app details
   * This observable is used to get the app details from the database
   * @returns - Observable<any>
   */
  getAppDetails(): Observable<any> {
    const url = `https://api.tonewebdesign.com/pa/steam/appdetails?appid=424030`;
    return this.http.get<SteamApiResponse>(url).pipe(
      map(response => response['424030'].data)
    );
  }

  /**
   * Get app news
   * This observable is used to get the app news from the database
   * @returns - Observable<NewsItem[]>
   */
  getAppNews(): Observable<NewsItem[]> {
    const url = `https://api.tonewebdesign.com/pa/steam/appnews?appid=424030`;
    return this.http.get<SteamApiResponse2>(url).pipe(
      map(response => response.appnews.newsitems)
    );
  }

  /**
   * Get steam id
   * This observable is used to get the steam id from the database
   * @param steamId - string - the steam id
   * @returns - Observable<any>
   */
  getSteamId(steamId: string): Observable<any> {
    const url = `https://api.tonewebdesign.com/pa/steamid/${steamId}`;
    return this.http.get(url);
  }

  /**
   * Get user's steam id's from their user profile
   * @param profileUrl 
   * @returns 
   */
  getIdsFromProfile(profileUrl: string): Observable<any> {
    const url = 'https://api.tonewebdesign.com/pa/getSteamId';
    return this.http.post(url, {
      profileUrl
    }, httpOptions);
  }
}

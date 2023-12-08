/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\favorite.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu December 7th 2023 5:55:46 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Favorite } from "../_models/favorite";

const API = "https://api.wortool.com/v2/favorites";

@Injectable({
  providedIn: "root",
})
export class FavoriteService {
  constructor(private http: HttpClient) {}

  /**
   * Get all favorites by mapId and userId
   * This observable is used to get all favorites by mapId and userId from the database
   * @param mapId - string - the map id
   * @param userId - string - the user id
   * @returns - Observable<Favorite[]>
   */
  getByBothIds(mapId: string, userId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/user/${userId}/map/${mapId}`);
  }

  /**
   * Get all favorites by mapId
   * This observable is used to get all favorites by mapId from the database
   * @param mapId - string - the map id
   * @returns - Observable<Favorite[]>
   */
  getByMapId(mapId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/map/${mapId}`);
  }

  /**
   * Get all favorites by userId
   * This observable is used to get all favorites by userId from the database
   * @param userId - string - the user id
   * @returns - Observable<Favorite[]>
   */
  getByUserId(userId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/user/${userId}`);
  }

  /**
   * Create or update favorite
   * This observable is used to create or update a favorite in the database
   * @param route - string - the route
   * @param mapId - string - the map id
   * @param userId - string - the user id
   * @param type - string - the type
   * @returns - Observable<Favorite>
   */
  createOrUpdate(
    route: string,
    mapId: string,
    userId: string,
    type: string
  ): Observable<Favorite> {
    const data = {
      route: route,
      userId: userId,
      type: type,
    };

    return this.http.post<Favorite>(`${API}/user/${userId}/map/${mapId}`, data);
  }

  /**
   * Delete favorite
   * This observable is used to delete a favorite in the database
   * @param mapId - string - the map id
   * @param userId - string - the user id
   * @returns - Observable<any>
   */
  delete(mapId: string, userId: string): Observable<any> {
    return this.http.delete(`${API}/user/${userId}/map/${mapId}`);
  }
}

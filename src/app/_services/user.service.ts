/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\user.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:41:20 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user.model';

const API_URL = 'https://api.tonewebdesign.com/pa/muster/';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  /**
   * Get users
   * This observable is used to get all users from the database
   * @returns - Observable<User[]>
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}`);
  }

  /**
   * Get user by id
   * This observable is used to get a user by id from the database
   * @param id - number - the user id
   * @returns - Observable<User>
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/${id}`);
  }

  /**
   * Create user
   * This observable is used to create a user in the database
   * @param user - User - the user
   * @returns - Observable<User>
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}`, user);
  }

  /**
   * Update user
   * This observable is used to update a user in the database
   * @param user - User - the user
   * @returns - Observable<any>
   */
  updateUser(user: User): Observable<any> {
    // console.log(`${user.id} - ${user.nickname} | ev: ${user.events}, dr: ${user.drills}`)
    return this.http.put(`${API_URL}${user.id}`, user);
  }

  /**
   * Delete user
   * This observable is used to delete a user in the database
   * @param id - number - the user id
   * @returns - Observable<any>
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_URL}${id}`);
  }

}

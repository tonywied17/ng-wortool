/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_services\note.service.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:27:15 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../_models/note.model';

const API = 'https://api.tonewebdesign.com/pa/notes/map';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }

  /**
   * Get all notes by mapId and userId
   * This observable is used to get all notes by mapId and userId from the database
   * @param mapId - string - the map id
   * @param userId - string - the user id
   * @returns - Observable<Note[]>
   */
  getById(mapId: string, userId: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${API}/${userId}/${mapId}`);
  }
  
  /**
   * Create or update note
   * This observable is used to create or update a note in the database
   * @param mapId - string - the map id
   * @param userId - string - the user id
   * @param note - string - the note
   * @returns - Observable<Note>
   */
  createOrUpdate(mapId: string, userId: string, note: string): Observable<Note> {
    const data = {
      userId: userId,
      note: note
    };
  
    return this.http.post<Note>(`${API}/${userId}/${mapId}`, data);
  }

}

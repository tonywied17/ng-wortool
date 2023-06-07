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

  getById(mapId: string, userId: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${API}/${userId}/${mapId}`);
  }
  
  
  createOrUpdate(mapId: string, userId: string, note: string): Observable<Note> {
    const data = {
      userId: userId,
      note: note
    };
  
    return this.http.post<Note>(`${API}/${userId}/${mapId}`, data);
  }

}

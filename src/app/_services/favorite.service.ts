import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../_models/favorite';

const API = 'https://api.tonewebdesign.com/pa/favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(private http: HttpClient) { }

  getByBothIds(mapId: string, userId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/user/${userId}/map/${mapId}`);
  }

  getByMapId(mapId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/map/${mapId}`);
  }
  
  getByUserId(userId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/user/${userId}`);
  }
  
  createOrUpdate(route: string, mapId: string, userId: string, type: string): Observable<Favorite> {
    const data = {
      route: route,
      userId: userId,
      type: type
    };
  
    return this.http.post<Favorite>(`${API}/user/${userId}/map/${mapId}`, data);
  }

  delete(mapId: string, userId: string): Observable<any> {
    return this.http.delete(`${API}/user/${userId}/map/${mapId}`);
  }

}

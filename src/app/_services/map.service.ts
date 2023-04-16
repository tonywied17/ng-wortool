import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Map } from '../_models/map.model';

const baseUrl = 'https://api.tonewebdesign.com/pa/maps';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(baseUrl);
  }

  get(id: any): Observable<Map[]> {
    return this.http.get<Map[]>(`${baseUrl}/${id}`);
  }
}

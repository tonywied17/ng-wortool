// muster-user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusterUserService {
  private baseUrl = 'https://api.tonewebdesign.com/pa/musteruser';

  constructor(private http: HttpClient) { }

  getAll(regimentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reg/${regimentId}`);
  }

  getOne(regimentId: number, discordId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reg/${regimentId}/user/${discordId}`);
  }

  update(updatedData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, updatedData);
  }

  create(newData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, newData);
  }

  incrementEvents(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/incr-events`, data);
  }

  incrementDrills(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/incr-drills`, data);
  }
}

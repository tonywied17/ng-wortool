import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

let API = "https://api.tonewebdesign.com/pa/regiments/";

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

  getRegiments(): Observable<any> {
    return this.http.get(API);
  }

  getRegiment(regimentId: number): Observable<any> {
    return this.http.get(API + regimentId);
  }

  getRegimentUsers(regimentId: any): Observable<any> {
    return this.http.get(API + regimentId  + '/users');
  }

  updateRegiment(regimentId: number, regiment: any, guild_id: any, guild_avatar: any, invite_link: any, website: any, description: any): Observable<any> {
    
    return this.http.put(API + regimentId + '/update', {
      regiment,
      guild_id,
      guild_avatar,
      invite_link,
      website,
      description
    }, httpOptions);
  }

  

}

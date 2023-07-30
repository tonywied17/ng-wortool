import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

let API = "https://api.tonewebdesign.com/pa/regiments/";
let AUTH_API = "https://api.tonewebdesign.com/pa/auth/";


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

  updateRegiment(userId: any, regimentId: number, regiment: any, guild_id: any, guild_avatar: any, invite_link: any, website: any, description: any, side: any): Observable<any> {
    
    return this.http.put(API + regimentId + '/update', {
      userId,
      regiment,
      guild_id,
      guild_avatar,
      invite_link,
      website,
      description,
      side,
    }, httpOptions);
  }

  syncRegiment(requestedDomain: string, userId: any, regimentId: number, regiment: any, guild_id: any, guild_avatar: any, invite_link: any, website: any, description: any, side: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-requested-domain': requestedDomain
    });
  
    const data = {
      userId,
      regiment,
      guild_id,
      guild_avatar,
      invite_link,
      website,
      description,
      side,
    };
  
    return this.http.put(API + regimentId + '/change', data, { headers });
  }

  removeUsersRegiment(userId: number): Observable<any> {
    return this.http.delete(API + userId + '/remove');
  }
  

  setModerator(userId: any): Observable<any> {
    return this.http.put(AUTH_API + userId + '/setModerator', {
      userId
    }, httpOptions);
  }

  removeModerator(userId: number): Observable<any> {
    return this.http.put(AUTH_API + userId + '/removeModerator', {
      userId
    }, httpOptions);
  }

  ///pa/regiments/gameid/:steamId
  getSteamId(userId: number, steamId: number): Observable<any> {
    return this.http.get(API + 'gameid/' + steamId);
  }

  getGameIds(userId: number, regimentId: number): Observable<any> {
    return this.http.get(API + regimentId + '/gameids');
  }
  
  getGameId(userId: number, regimentId: number, gameId: number): Observable<any> {
    return this.http.get(API + regimentId + '/gameids/' + gameId);
  }

  // set game id // /pa/regiments/:regimentId/gameid
  setGameId(userId: number, regimentId: number, steamId: number): Observable<any> {
    return this.http.post(API + regimentId + '/gameid', {
      steamId,
    }, httpOptions);
  }

}

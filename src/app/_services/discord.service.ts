import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


let API = "https://api.tonewebdesign.com/pa/discord";

@Injectable({
  providedIn: 'root'
})
export class DiscordService {

  constructor(
    private http: HttpClient
  ) { }


  getAll(): Observable<any> {
    return this.http.get<any>(`${API}/users`);
  }

  getOne(userId: string): Observable<any> {
    return this.http.get<any>(`${API}/user/${userId}`);
  }

  getGuildChannels(guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/channels`);
  }

  getUserGuildInfo(discordId: string, guildId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/user/${discordId}/get`);
  }
  //https://api.tonewebdesign.com/pa/discord/guild/850786736756883496/channel/901993697888051200/webhook
  createWebhook(guildId: string, channelId: string): Observable<any> {
    return this.http.get<any>(`${API}/guild/${guildId}/channel/${channelId}/webhook`);
  }

  removeDiscordUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${API}/user/${userId}/remove`);
  }
  
}

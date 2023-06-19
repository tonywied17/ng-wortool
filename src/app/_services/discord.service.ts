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

  getOne(id: string): Observable<any> {
    return this.http.get<any>(`${API}/user/${id}`);
  }


}

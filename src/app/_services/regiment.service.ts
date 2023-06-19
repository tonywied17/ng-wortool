import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

let API = "https://api.tonewebdesign.com/pa/regiments/";


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

  getRegimentUsers(regimentId: number): Observable<any> {
    return this.http.get(API + regimentId  + '/users');
  }
  
}

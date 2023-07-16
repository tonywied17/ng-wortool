import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WorService {

  constructor(
    private http: HttpClient
  ) { }

    API = 'https://api.tonewebdesign.com/pa/wor/';

  getRecaps(): Observable<any> {
    return this.http.get(this.API + 'recaps');
  }
}

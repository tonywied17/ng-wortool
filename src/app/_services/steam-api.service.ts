import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface SteamApiResponse {
  [key: string]: {
    data: any;
    // Add other properties if necessary
  };
}

interface SteamApiResponse2 {
  appnews: {
    appid: number;
    newsitems: NewsItem[];
  };
}

interface NewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

@Injectable({
  providedIn: 'root'
})


export class SteamApiService {


  constructor(private http: HttpClient) { }

  getAppDetails(): Observable<any> {
    const url = `https://api.tonewebdesign.com/pa/steam/appdetails?appid=424030`;
    return this.http.get<SteamApiResponse>(url).pipe(
      map(response => response['424030'].data)
    );
  }

  getAppNews(): Observable<NewsItem[]> {
    const url = `https://api.tonewebdesign.com/pa/steam/appnews?appid=424030`;
    return this.http.get<SteamApiResponse2>(url).pipe(
      map(response => response.appnews.newsitems)
    );
  }

  //https://api.tonewebdesign.com/pa/steamid/76561198000469634
  getSteamId(steamId: string): Observable<any> {
    const url = `https://api.tonewebdesign.com/pa/steamid/${steamId}`;
    return this.http.get(url);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'https://api.tonewebdesign.com/pa';

  constructor(private http: HttpClient) { }

  upload(file: File, regimentId: any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/regiments/${regimentId}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(regimentId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/regiments/${regimentId}/files/`);
  }

  remove(regimentId: any, file: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/regiments/${regimentId}/files/${file}`)
  }
}

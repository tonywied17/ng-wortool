import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'https://api.wortool.com/v2/';

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


  uploadCover(file: File, regimentId: any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    formData.append('regimentId', regimentId);
    
    const req = new HttpRequest('POST', `${this.baseUrl}/regiments/${regimentId}/upload/cover`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(regimentId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/regiments/${regimentId}/files/`);
  }

  getCover(regimentId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/regiments/${regimentId}/files/cover`);
  }

  remove(regimentId: any, file: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/regiments/${regimentId}/files/${file}`)
  }

  removeCover(regimentId: any, file: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/regiments/${regimentId}/files/cover/${file}`)
  }
}

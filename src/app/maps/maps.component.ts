import { Component, OnInit, Input } from '@angular/core';
import { MapService } from '../_services/map.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { Map } from '../_models/map.model';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  map?: Map[];
  currentMap: Map = {};
  currentIndex = -1
  showMapPage = false;
  loading = true;
  currentUser: any;
  isLoggedIn = false;
  
  constructor(private mapService: MapService, private token: TokenStorageService, ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    this.getMaps();
  }


  setActiveMap(map: Map, index: number): void {
    this.currentMap = map;
    this.currentIndex = index;
    this.showMapPage = true
  }

  getMaps(): void {
    this.mapService.getAll()
      .subscribe({
        next: (data) => {
          this.map = data;

          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }
  
  scroll() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}

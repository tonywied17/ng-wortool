import { Component, OnInit, Input } from '@angular/core';
import { MapService } from '../map.service';
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

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
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

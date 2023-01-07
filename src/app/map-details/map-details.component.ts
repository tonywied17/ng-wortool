import { Component, OnInit, Input } from '@angular/core';
import { Map } from '../_models/map.model';
import { MapService } from '../map.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-map-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss']
})
export class MapDetailsComponent implements OnInit {

  data: any;

  @Input() viewMode = false;

  @Input() currentMap: any;

  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getMap(this.route.snapshot.params["id"]);
  }

  getMap(id: string): void {
    this.mapService.get(id)
      .subscribe({
        next: (data) => {
          this.currentMap = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

}

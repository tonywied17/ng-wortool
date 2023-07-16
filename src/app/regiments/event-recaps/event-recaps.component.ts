import { Component, OnInit } from '@angular/core';
import { WorService } from "../../_services/wor.service";
import { RegimentService } from "../../_services/regiment.service";
import { MapService } from 'src/app/_services/map.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-event-recaps',
  templateUrl: './event-recaps.component.html',
  styleUrls: ['./event-recaps.component.scss']
})
export class EventRecapsComponent implements OnInit {

  isDataLoaded: boolean = false;
  recaps: any;
  maps: any;

  constructor(
    private worService: WorService,
    private regimentService: RegimentService,
    private mapService: MapService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getRecaps();
    await this.getMaps();
    this.isDataLoaded = true;
  }

  async getRecaps(): Promise<void> {
    this.recaps = await firstValueFrom(this.worService.getRecaps());
    console.log(this.recaps);
  }

  async getMaps(): Promise<void> {
    this.maps = await firstValueFrom(this.mapService.getAll());

    // Joining maps with recaps based on matching map names
    this.recaps.forEach((recap: any) => {
      const matchingMap = this.maps.find((map: any) => map.map.toLowerCase() === recap.map.toLowerCase());
      if (matchingMap) {
        recap.mapObject = matchingMap;
      } else {
        recap.mapObject = { map: "No Map Data Found" };
      }
    });

    console.log(this.recaps);
  }

  convertToLocaleTime(epochTime: number): string {
    const date = new Date(epochTime * 1000); // Convert epoch time to milliseconds
  
    return date.toLocaleString(); // Convert to the browser's local time string
  }
  

  getPlayersByTeamId(teamId: number): any[] {
    return this.recaps.players.filter((player: { TeamId: number; }) => player.TeamId === teamId);
  }
  
}

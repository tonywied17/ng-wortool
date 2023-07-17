import { Component, OnInit } from "@angular/core";
import { WorService } from "../../_services/wor.service";
import { RegimentService } from "../../_services/regiment.service";
import { MapService } from "src/app/_services/map.service";
import { SteamApiService } from "../../_services/steam-api.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-event-recaps",
  templateUrl: "./event-recaps.component.html",
  styleUrls: ["./event-recaps.component.scss"],
})
export class EventRecapsComponent implements OnInit {
  isDataLoaded: boolean = false;
  recaps: any;
  maps: any;
  gameDetails: any;
  screenshots: any;
  randomImages: any;
  players: any;
  steamPlayers: any;
  commaIDS: any;

  constructor(
    private worService: WorService,
    private regimentService: RegimentService,
    private steamApiService: SteamApiService,
    private mapService: MapService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getRecaps();
    await this.getMaps();
    await this.getAppDetails();
    this.isDataLoaded = true;
  }

  async getAppDetails(): Promise<void> {
    try {
      const data = await this.steamApiService.getAppDetails().toPromise();
      this.gameDetails = data;
      this.screenshots = this.gameDetails.screenshots;
      this.assignRandomScreenshots();
    } catch (error) {}
  }

  assignRandomScreenshots(): void {
    this.recaps.forEach((recap: any) => {
      const randomIndex = Math.floor(Math.random() * this.screenshots.length);
      recap.randThumbnail = this.screenshots[randomIndex].path_thumbnail;
    });
  }

  randomImg(): void {
    this.recaps.forEach((recap: any) => {
      recap.randThumbnail =
        this.screenshots[
          Math.floor(Math.random() * this.screenshots.length)
        ].path_thumbnail;
    });
  }

  async getRecaps(): Promise<void> {
    this.recaps = await firstValueFrom(this.worService.getRecaps());
    console.log(this.recaps);
  
    this.players = this.recaps.flatMap((recap: any) => recap.players);
    console.log(this.players);
  
    this.commaIDS = this.players.map((player: any) => player.SteamID).join(",");
  
    this.steamPlayers = await this.getSteamUser(this.commaIDS);
    console.log(this.steamPlayers);
    this.players.forEach((player: any) => {
      const steamPlayer = this.steamPlayers.find((steamPlayer: any) => steamPlayer.steamid === player.SteamID.toString());
      if (steamPlayer) {
        player.avatar= steamPlayer.avatar;
      }
    });

  }
  
  async getSteamUser(steamIds: string): Promise<any> {
    const steamUser = await firstValueFrom(
      this.steamApiService.getSteamId(steamIds)
    );
    return steamUser.response.players;
  }
  

  async getMaps(): Promise<void> {
    this.maps = await firstValueFrom(this.mapService.getAll());

    // Joining maps with recaps based on matching map names
    this.recaps.forEach((recap: any) => {
      const matchingMap = this.maps.find(
        (map: any) => map.map.toLowerCase() === recap.map.toLowerCase()
      );
      if (matchingMap) {
        recap.mapObject = matchingMap;
      } else {
        recap.mapObject = { map: "No Map Data Found" };
      }
    });
  }

  convertToLocaleTime(epochTime: number): string {
    const date = new Date(epochTime * 1000); // Convert epoch time to milliseconds

    return date.toLocaleString(); // Convert to the browser's local time string
  }

  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  filterPlayersByTeamId(teamId: number): any[] {
    return this.recaps.players.filter(
      (player: { TeamId: number }) => player.TeamId === teamId
    );
  }
}

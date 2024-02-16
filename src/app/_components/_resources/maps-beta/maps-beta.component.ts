import { Component, HostListener, type OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { WeaponService } from "src/app/_services/weapon.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: "app-maps-beta",
  templateUrl: "./maps-beta.component.html",
  styleUrls: ["./maps-beta.component.scss"],
  animations: [
    trigger('cardAnimation', [
      state('default', style({
        transform: 'scale(1)',
        opacity: '0.8',
      })),
      state('hover', style({
        transform: 'scale(1.04)',
        opacity: '1',
      })),
      transition('default <=> hover', animate('300ms ease-in-out'))
    ])
  ]
})
export class MapsBetaComponent implements OnInit {
  isLoaded: boolean = false;
  maps: any;

  isDesktop: boolean = true;
  animationStates: {[index: number]: string} = {};
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkDeviceType();
  }
  checkDeviceType() {
    this.isDesktop = window.innerWidth > 768;
  }
  onMouseEnter(i: number) {
    if (this.isDesktop) { 
      this.animationStates[i] = 'hover';
    }
  }

  onMouseLeave(i: number) {
    if (this.isDesktop) { 
      this.animationStates[i] = 'default';
    }
  }
  
  constructor(
    private mapService: MapService,
    private weaponService: WeaponService,
    private tokenStorageService: TokenStorageService,
    public sharedDataService: SharedDataService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.sharedDataService
      .retrieveInitialData()
      .then(async () => {
        await this.retrieveMaps();
        this.isLoaded = true;
        console.log(this.isLoaded)
      })
      .catch((error) => {
        console.error("Error initializing shared data:", error);
      });
  }

  async retrieveMaps(): Promise<void> {
    this.mapService.getAllMapsVerbose().subscribe((data) => {
        this.maps = data;
        console.log("Retrieved maps:", this.maps);
    });
  }
}

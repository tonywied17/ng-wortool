import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/_services/map.service';
import { WeaponService } from 'src/app/_services/weapon.service';

@Component({
  selector: 'app-manage-maps',
  templateUrl: './manage-maps.component.html',
  styleUrls: ['./manage-maps.component.scss']
})
export class ManageMapsComponent implements OnInit {
  currentMap: any = { wor_mapsRegiments: [] };
  editMode: boolean = false;
  maps: any[] = [];
  usaRegiments: any[] = [];
  csaRegiments: any[] = [];
  weapons: any[] = []; 

  constructor(private mapService: MapService, private weaponService: WeaponService) { }

  ngOnInit(): void {
    this.retrieveMaps();
    this.retrieveWeapons();
  }


  filterAndSortRegiments(): void {
    this.usaRegiments = this.currentMap.wor_mapsRegiments
      .filter((regiment: { side: string; }) => regiment.side === 'USA')
      .sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name));
    this.csaRegiments = this.currentMap.wor_mapsRegiments
      .filter((regiment: { side: string; }) => regiment.side === 'CSA')
      .sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name));
  }

  retrieveMaps(): void {
    this.mapService.getAllMaps().subscribe(data => {
      console.log("Retrieved maps:", data);
      this.maps = data;
      this.filterAndSortRegiments();
    });
  }

  retrieveWeapons(): void {
        this.weaponService.getAll().subscribe(
          (data: any) => {
            this.weapons = JSON.parse(data);
          },
          (error: any) => {
            console.error("Error retrieving weapons:", error);
          }
        );
  }

  getWeaponNameById(id: number): string {
    const weapon = this.weapons.find(weapon => weapon.id === id);
    return weapon ? weapon.weapon : 'Unknown Weapon';
  }
  
  selectMap(map: any): void {
    console.log("Selected map:", map); 
    this.currentMap = JSON.parse(JSON.stringify(map));
    this.editMode = true;
    this.filterAndSortRegiments();
  }

  addRegiment(side: string): void {
    this.currentMap.wor_mapsRegiments.push({
      name: '',
      side: side ? side : 'CSA',
      type: 'Infantry',
      wor_mapsRegimentWeapons: []
    });
  }

  addWeapon(regimentIndex: number): void {
    const newWeapon = {
      unitWeaponId: null,
      mapId: this.currentMap.id,
      mapsRegimentsId: this.currentMap.wor_mapsRegiments[regimentIndex].id
    };
    this.currentMap.wor_mapsRegiments[regimentIndex].wor_mapsRegimentWeapons.push(newWeapon);
  }
  

  removeRegiment(index: number): void {
    this.currentMap.wor_mapsRegiments.splice(index, 1);
  }

  removeWeapon(regimentIndex: number, weaponIndex: number): void {
    this.currentMap.wor_mapsRegiments[regimentIndex].wor_mapsRegimentWeapons.splice(weaponIndex, 1);
  }
  

  updateMap(): void {
    this.mapService.updateMap(this.currentMap.id, this.currentMap).subscribe(response => {
      console.log(response);
      this.editMode = false;
      this.retrieveMaps()
    });
  }

  updateCompleteMap(): void {
    console.log('sending data::', this.currentMap);
    this.mapService.updateMap(this.currentMap.id, this.currentMap).subscribe({
      next: (response) => {
        console.log("response::", response);
        this.editMode = false;
        this.retrieveMaps();
      },
      error: (error) => {
        console.error("Error updating the map:", error);
      }
    });
  }
  
  
}

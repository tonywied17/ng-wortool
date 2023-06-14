import { Component, OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-server-info",
  templateUrl: "./server-info.component.html",
  styleUrls: ["./server-info.component.scss"],
})
export class ServerInfoComponent implements OnInit {
  sn!: string;
  pw!: string;
  skirm!: string;
  skirm2!: string;
  map1!: string;
  map2!: string;
  r1side!: string;
  r1reg!: string;
  r1unit!: string;
  r2side!: string;
  r2reg!: string;
  r2unit!: string;
  extra!: string;
  allChecked = true;
  naChecked = true;
  euChecked!: boolean;
  map: any;

  mapNames: any;

  campaign!: string;
  filteredMapNames1: any[] = [];
  filteredMapNames2: any[] = [];


  constructor(
    private mapService: MapService,
    private snackBar: MatSnackBar
    ) {}

  ngOnInit(): void {
    this.getMaps();
    setTimeout(() => {

console.log(this.map)
    }, 1000);
  }

  getMaps(): void {
    this.mapService.getAll().subscribe({
      next: (data) => {
        this.map = data;
        this.mapNames = data.reduce((acc: any, m: any) => {
          acc[m.map] = m.campaign;
          return acc;
        }, {});
      },
      error: (e) => console.error(e),
    });
  }
  

  onCampaignChange(): void {
    if (this.skirm.includes("Antietam")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames1 = [
        ...(organizedData["Antietam"] || []),
        ...(organizedData["Antietam Conquest"] || [])
      ];
    } else if (this.skirm.includes("Harpers Ferry")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames1 = [
        ...(organizedData["Harpers Ferry"] || []),
        ...(organizedData["Harpers Ferry Conquest"] || [])
      ];
    } else if (this.skirm.includes("South Mountain")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames1 = [
        ...(organizedData["South Mountain"] || []),
        ...(organizedData["South Mountain Conquest"] || [])
      ];
    } else {
      this.filteredMapNames1 = [];
    }

  }

  onCampaignChange2(): void {
    if (this.skirm2.includes("Antietam")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames2 = [
        ...(organizedData["Antietam"] || []),
        ...(organizedData["Antietam Conquest"] || [])
      ];
    } else if (this.skirm2.includes("Harpers Ferry")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames2 = [
        ...(organizedData["Harpers Ferry"] || []),
        ...(organizedData["Harpers Ferry Conquest"] || [])
      ];
    } else if (this.skirm2.includes("South Mountain")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames2 = [
        ...(organizedData["South Mountain"] || []),
        ...(organizedData["South Mountain Conquest"] || [])
      ];
    } else {
      this.filteredMapNames2 = [];
    }
  }
  
  
  
  organizeByCampaign(mapNames: any): any {
    const organizedData: any = {};
  
    // Sort map names alphabetically
    const sortedMapNames = Object.keys(mapNames).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  
    for (const map of sortedMapNames) {
      const campaign = mapNames[map];
      if (!organizedData.hasOwnProperty(campaign)) {
        organizedData[campaign] = [];
      }
      organizedData[campaign].push(map);
    }
  
    return organizedData;
  }
  
  
  

  sendMessage(): void {
    const discordWebhook =
      "https://discord.com/api/webhooks/977298085959053312/mXJgUGr0F4EX_ID_CAPi8R2M-LvxwkWFpmyLZ_pifB3-boVyHkLGuZa_xKdXyPxLc-1Y";
    const params = {
      username: "Event Information",
      avatar_url:
        "https://cdn.discordapp.com/app-icons/977585539773505557/985b16a9cc12f71f54080243e443ff26.png?size=256",
      content: `${this.getRoles()}
__Server__
**Server Name:** ${this.sn}
**Password:** \`${this.pw}\`

__First Round__
**Skirmish Area:** ${this.skirm}
**Map:** ${this.map1}
**Side:** ${this.r1side}
**Regiment:** \`${this.r1reg}\`
> ${this.r1unit}

__Second Round__
**Skirmish Area:** ${this.skirm2}
**Map:** ${this.map2}
**Side:** ${this.r2side}
**Regiment:** \`${this.r2reg}\`
> ${this.r2unit}

 __Extras__
${this.extra}

__#PA Army App__
:link: ${this.getMapLink(this.map1)}
:link: ${this.getMapLink(this.map2)}`,
    };

    if (!this.sn || !this.pw || !this.map1) {
      this.snackBar.open("Please fill in the required fields: server name, password, or map", "Close", {
        verticalPosition: 'top',
        duration: 3000 
      });
    } else {
      this.sendWebhook(discordWebhook, params);
      this.snackBar.open("Server information posted to announcements", "Close", {
        verticalPosition: 'top',
        duration: 3000 
      });
    }
    
  }

  getRoles(): string {
    let roles = "";
    if (this.allChecked) {
      roles += "<@&682323346611896392> ";
    }
    if (this.naChecked) {
      roles += "<@&682502227281182771> ";
    }
    if (this.euChecked) {
      roles += "<@&682502128929079321> ";
    }
    return roles.trim();
  }

  getMapLink(map: string): string {
    const matchedMap = this.map.find((item: any) => item.map === map);
    if (matchedMap) {
      return `https://app.paarmy.com/maps/${matchedMap.id}`;
    }
    return "";
  }
  
  

  sendWebhook(url: string, params: any): void {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(params));
  }

  
}

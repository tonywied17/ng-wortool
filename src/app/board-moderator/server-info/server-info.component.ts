import { Component, OnInit } from "@angular/core";
import { MapService } from "src/app/_services/map.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TokenStorageService } from "../../_services/token-storage.service";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { DiscordService } from "src/app/_services/discord.service";

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

  currentUser: any;
  isLoggedIn = false;

  regimentID: any;
  regimentData: any;
  regimentSelected = true;

  description: any;
  invite_link: any;
  website: any;

  regimentChannels: any;

  targetChannel: any;
  discordWebhook: any;

  constructor(
    private mapService: MapService, 
    private snackBar: MatSnackBar,
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private token: TokenStorageService,
    private authService: AuthService
    ) {}

  async ngOnInit(): Promise<void> {
    this.getMaps();
    setTimeout(() => {
      // console.log(this.map)
    }, 1000);


    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      await this.authService.checkModeratorRole(userID, this.currentUser.regimentId).toPromise()
        .then((response) => {
          if (this.currentUser.regimentId) {
            this.regimentID = this.currentUser.regimentId;
            this.getRegiment();
          }
        })
        .catch((error) => {
          if (error.status === 403) {
            this.regimentSelected = false;
          } else {
            console.error("Error:", error);
          }
        });
    } 
    
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
        ...(organizedData["Antietam Conquest"] || []),
      ];
    } else if (this.skirm.includes("Harpers Ferry")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames1 = [
        ...(organizedData["Harpers Ferry"] || []),
        ...(organizedData["Harpers Ferry Conquest"] || []),
      ];
    } else if (this.skirm.includes("South Mountain")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames1 = [
        ...(organizedData["South Mountain"] || []),
        ...(organizedData["South Mountain Conquest"] || []),
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
        ...(organizedData["Antietam Conquest"] || []),
      ];
    } else if (this.skirm2.includes("Harpers Ferry")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames2 = [
        ...(organizedData["Harpers Ferry"] || []),
        ...(organizedData["Harpers Ferry Conquest"] || []),
      ];
    } else if (this.skirm2.includes("South Mountain")) {
      const organizedData = this.organizeByCampaign(this.mapNames);
      this.filteredMapNames2 = [
        ...(organizedData["South Mountain"] || []),
        ...(organizedData["South Mountain Conquest"] || []),
      ];
    } else {
      this.filteredMapNames2 = [];
    }
  }

  organizeByCampaign(mapNames: any): any {
    const organizedData: any = {};

    // Sort map names alphabetically
    const sortedMapNames = Object.keys(mapNames).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
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
    const embed: any = {
      username: "Server Info",
      avatar_url: this.regimentData.guild_avatar,
      embeds: [
        {
          title: "Server Information",
          description: this.getRoles(),
          thumbnail: {
            url: "https://molex.cloud/2023/June/27/_HmN/boticon.png",
          },
          fields: [],
          footer: {
            text: "#PA Army App",
            icon_url: "https://app.paarmy.com/assets/icon.png",
          },
          color: 13092744,
        },
      ],
    };
  
    if (!this.sn || !this.pw) {
      this.snackBar.open(
        "Please fill in the required fields: server name and password",
        "Close",
        {
          verticalPosition: "top",
          duration: 3000,
        }
      );
    } else {
      if (this.sn) {
        embed.embeds[0].fields.push({ name: "Server Name", value: this.sn });
      }
      if (this.pw) {
        embed.embeds[0].fields.push({ name: "Password", value: `\`${this.pw}\`` });
      }
      const firstRoundInfo = this.getFirstRoundInfo();
      if (firstRoundInfo) {
        embed.embeds[0].fields.push({ name: "__**First Round**__", value: firstRoundInfo });
      }
      const secondRoundInfo = this.getSecondRoundInfo();
      if (secondRoundInfo) {
        embed.embeds[0].fields.push({ name: "__**Second Round**__", value: secondRoundInfo });
      }
      if (this.extra) {
        embed.embeds[0].fields.push({ name: "Extras", value: this.extra });
      }
  
      this.sendWebhook(this.discordWebhook, embed);
      this.snackBar.open(
        "Server information posted to announcements",
        "Close",
        {
          verticalPosition: "top",
          duration: 3000,
        }
      );
    }
  }
  
  
  
  
  
  getFirstRoundInfo(): string {
    let info = "";
    if (this.skirm) {
      info += `**Skirmish Area:** ${this.skirm}\n`;
    }
    if (this.map1) {
      info += `**Map:** [${this.map1}](${this.getMapLink(this.map1)})\n`;
    }
    if (this.r1side) {
      info += `**Side:** ${this.r1side}\n`;
    }
    if (this.r1reg) {
      info += `**Regiment:** \`${this.r1reg}\`\n`;
    }
    if (this.r1unit) {
      info += `**Units:** ${this.r1unit}\n`;
    }
    return info;
  }
  
  getSecondRoundInfo(): string {
    let info = "";
    if (this.skirm2) {
      info += `**Skirmish Area:** ${this.skirm2}\n`;
    }
    if (this.map2) {
      info += `**Map:** [${this.map2}](${this.getMapLink(this.map2)})\n`;
    }
    if (this.r2side) {
      info += `**Side:** ${this.r2side}\n`;
    }
    if (this.r2reg) {
      info += `**Regiment:** \`${this.r2reg}\`\n`;
    }
    if (this.r2unit) {
      info += `**Units:** ${this.r2unit}\n`;
    }
    return info;
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

    if (this.regimentData.guild_id !== '681641606398607401') {
      roles = "";
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


  async getRegiment(): Promise<void> {
    if (this.regimentID) {
      await this.regimentService.getRegiment(this.regimentID).toPromise()
        .then((response) => {
          this.regimentData = response;
          this.regimentSelected = true;
          this.discordWebhook = this.regimentData.webhook;
          this.targetChannel = this.regimentData.webhook_channel;
          console.log(this.discordWebhook)
        })
        .catch(() => {
          this.regimentSelected = false;
        });
    } else {
      this.regimentSelected = false;
    }
  }

}

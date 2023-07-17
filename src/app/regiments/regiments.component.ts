import { Component, OnInit } from "@angular/core";
import { RegimentService } from "../_services/regiment.service";
import { DiscordService } from "../_services/discord.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map } from "rxjs/operators";

@Component({
  selector: "app-regiments",
  templateUrl: "./regiments.component.html",
  styleUrls: ["./regiments.component.scss"],
})
export class RegimentsComponent implements OnInit {
  regiments: any;
  regimentUsers: any;
  regimentID: any;
  searchText: any;
  isDataLoaded: boolean = false;

  constructor(
    private regimentService: RegimentService,
    private snackBar: MatSnackBar,
    private discordService: DiscordService
  ) {}

  ngOnInit(): void {
    this.getRegiments();
  }

  filterRegiments() {
    this.regimentService
      .getRegiments()
      .pipe(
        map((regiments) =>
          regiments.filter((regiment: any) => {
            return regiment.regiment
              .toLowerCase()
              .includes(this.searchText.toLowerCase());
          })
        )
      )
      .subscribe((filteredRegiments) => {
        this.regiments = filteredRegiments;
      });
  }

  getRegiments() {
    this.regimentService.getRegiments().subscribe((regiments) => {
      this.regiments = regiments;
      this.fetchRegimentUsers();
      // 
    });
  }

  async fetchRegimentUsers(): Promise<void> {
    const fetchPromises = this.regiments.map((regiment: any) =>
      this.getRegimentUsers(regiment.id).then(() => {
        regiment.members = this.regimentUsers;
        return this.getDiscordRegimentData(regiment.guild_id, regiment);
      })
    );

    await Promise.all(fetchPromises);
    
  }

  async getRegimentUsers(guildId: string): Promise<void> {
    await this.regimentService
      .getRegimentUsers(guildId)
      .toPromise()
      .then((response: any) => {
        
        this.regimentUsers = response;
      });
  }

  async getDiscordRegimentData(guildId: string, regiment: any): Promise<void> {
    await this.discordService
      .getRegimentGuild(guildId)
      .toPromise()
      .then((response: any) => {
        if (!regiment.guild_avatar || regiment.guild_avatar !== response.guild.iconURL) {
          regiment.guild_avatar = response.guild.iconURL;
          // Update the guild_avatar using the regiment service
          this.regimentService.updateRegiment(
            regiment.userId,
            regiment.id,
            regiment.regiment,
            regiment.guild_id,
            regiment.guild_avatar,
            regiment.invite_link,
            regiment.website,
            regiment.description,
            regiment.side
          ).subscribe(
            (updatedRegiment: any) => {
              // Update successful, do something if needed
            },
            (error: any) => {
              // Update failed, handle the error if needed
            }
          );
        }
        this.isDataLoaded = true;
      });
  }
  
  

  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

  // mat snackbar for popup message

  notYet() {
    this.snackBar.open("This feature is not yet available", "OK", {
      duration: 5000,
      verticalPosition: "top",
    });
  }
}

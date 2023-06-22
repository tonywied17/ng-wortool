import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../../_services/token-storage.service";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { DiscordService } from "src/app/_services/discord.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmDeleteSnackbarComponent } from "../../confirm-delete-snackbar/confirm-delete-snackbar.component";

@Component({
  selector: 'app-regiment-settings',
  templateUrl: './regiment-settings.component.html',
  styleUrls: ['./regiment-settings.component.scss']
})
export class RegimentSettingsComponent implements OnInit {

  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showMod = false;

  regimentID: any;
  regimentData: any;
  regimentSelected = true;

  regiment: any;
  guild_id: any;
  guild_avatar: any;
  description: any;
  invite_link: any;
  website: any;

  regimentChannels: any;
  regimentUsers: any;

  targetChannel: any;
  webhook: any;


  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,

  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      await this.authService.checkModeratorRole(userID).toPromise()
        .then((response) => {
          this.showMod = response.access;
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

  async getRegiment(): Promise<void> {
    if (this.regimentID) {
      await this.regimentService.getRegiment(this.regimentID).toPromise()
        .then((response) => {
          this.regimentData = response;
          this.getRegimentChannels(this.regimentData.guild_id);
          this.getRegimentUsers(this.regimentData.id);
          this.regimentSelected = true;

          this.regiment = this.regimentData.regiment;
          this.guild_id = this.regimentData.guild_id;
          this.guild_avatar = this.regimentData.guild_avatar;
          this.description = this.regimentData.description;
          this.invite_link = this.regimentData.invite_link;
          this.website = this.regimentData.website;

        })
        .catch(() => {
          this.regimentSelected = false;
        });
    } else {
      this.regimentSelected = false;
    }
  }

  async getRegimentChannels(guildId: string): Promise<void> {
    if (this.regimentID) {
      await this.discordService.getGuildChannels(guildId).toPromise()
        .then((response: any) => {
          this.regimentChannels = response.channels;
        });
    }
  }

  async getRegimentUsers(guildId: string): Promise<void> {
    if (this.regimentID) {
      await this.regimentService.getRegimentUsers(guildId).toPromise()
        .then((response: any) => {
          console.log(response);
          this.regimentUsers = response;
        });
    }
  }


  async updateTargetChannel(selectedValue: string): Promise<void> {
    this.targetChannel = selectedValue;

    setTimeout(async () => {
      await this.createWebhook(this.regimentData.guild_id, this.targetChannel);
    }, 300);
  }
  
  async createWebhook(guildId: string, channelId: string): Promise<void> {
    await this.discordService.createWebhook(guildId, channelId).toPromise()
      .then((response: any) => {
        console.log(response);
        this.webhook = response;
        this.snackBar.open(`$Webhook created for channel ${this.targetChannel}!`, 'Close', { duration: 3000 });
        this.getRegiment();
      });
  }

  async updateRegiment(){
    if (this.regimentID) {
      await this.regimentService.updateRegiment(this.regimentID, this.regiment, this.guild_id, this.guild_avatar, this.invite_link, this.website, this.description).toPromise()
        .then((response) => {
          console.log(response);
          this.snackBar.open(`Regiment Information Updated`, 'Close', { duration: 3000 });
          this.getRegiment();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }



  async syncDiscord() {
    const response = await fetch(`https://api.tonewebdesign.com/pa/discord/guild/${this.regimentData.guild_id}/get`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from endpoint. Status: ${response.status}`);
    }
    
    const data = await response.json();
    const discord = data.guild;

    this.regiment = discord.name;
    this.guild_avatar = discord.iconURL;
    this.guild_id = discord.id;

  }

  confirmRemoveUser(userId: any) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove ${userId} your Regiment?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeUserFromRegiment(userId);
    });
  }

  removeUserFromRegiment(userId: any){
    this.regimentService.removeUsersRegiment(userId).toPromise()
      .then((response) => {
        console.log(response);
        this.getRegimentUsers(this.regimentData.id);
        this.token.saveUser(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

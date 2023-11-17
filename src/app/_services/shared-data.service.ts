import { Injectable } from '@angular/core';
import { TokenStorageService } from "./token-storage.service";
import { AuthService } from "./auth.service";
import { RegimentService } from "./regiment.service";
import { DiscordService } from "src/app/_services/discord.service";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  currentUser: any;
  userId: any;
  isLoggedIn: boolean = false;
  regiment: any;
  regimentId!: number;
  guildId: string | undefined;
  showUser:boolean = false;
  showMod:boolean = false;
  isOwner:boolean = false;
  showAdmin:boolean = false;
  regimentSettingTabIndex: any;

  constructor(
    private regimentService: RegimentService,
    private discordService: DiscordService,
    public token: TokenStorageService,
    private authService: AuthService
  ) {}

  async retrieveInitialData(): Promise<void> {
    await Promise.all([this.getUser()]);
  }

  async getUser(): Promise<void> {
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      this.userId = this.currentUser.id;
  
      if (this.isLoggedIn) {
        await this.authService
          .checkModeratorRole(this.userId, this.currentUser.regimentId)
          .toPromise()
          .then(async (response) => {
            if (this.currentUser.regimentId) {
              this.regimentId = this.currentUser.regimentId;
              await this.getAccess();
              await this.getRegiment(this.regimentId);
            }
          })
          .catch((error) => {
            console.error("Error:", error);        
          });
      }
  }

  async getRegiment(id: any): Promise<void> {
    this.regiment = await firstValueFrom(this.regimentService.getRegiment(id));

    if(this.regiment.ownerId.includes(this.currentUser.discordId)) {
      this.isOwner = true;
    }else{
      this.isOwner = false;
    }

    this.guildId = this.regiment.guild_id;
  }

  async getAccess() {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;
    let userRegimentId = this.currentUser.regimentId;

    if (this.isLoggedIn) {

      this.authService.checkModeratorRole(userID, this.currentUser.regimentId).subscribe(
        (response: { access: boolean; }) => {
          if (userRegimentId == this.regimentId) {
            this.showMod = response.access;
          }

        },
        () => {
          this.showMod = false;
        }
      );

      this.authService.checkAdminRole(userID).subscribe(
        (response) => {
          this.showAdmin = response.access;
        },
        (error) => {
          if (error.status === 403) {
            this.showAdmin = false;
          } else {
            console.error("Error:", error);
          }
        }
      );
    }
  }

}

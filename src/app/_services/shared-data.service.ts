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
  discordData: any;

  constructor(
    private regimentService: RegimentService,
    private discordService: DiscordService,
    public token: TokenStorageService,
    private authService: AuthService
  ) {}

  async retrieveInitialData(): Promise<void> {
    console.log('retrieveInitialData ran')
    const userPromise = this.getUser();
    userPromise.then(() => {

    }).catch(error => console.error("Error retrieving user data:", error));

    await userPromise;
}



  async getUser(): Promise<void> {
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      this.userId = this.currentUser.id;
      if (this.isLoggedIn) {
        await this.getAccess();
            if (this.currentUser.regimentId) {
              this.regimentId = this.currentUser.regimentId;
              await this.getRegiment(this.regimentId);
            }
      }
  }

  async checkAndUpdateOtherUserAvatar(user: any): Promise<void> {
    console.log("User:", user)
    if (user.discordId && user.guildId) {
      try {
        const discordResponse = await firstValueFrom(this.discordService.getUserGuildInfo(user.discordId, user.guildId));
        
  
        if (user.avatar_url !== discordResponse.USER_SPECIFIC.DISCORD_AVATAR) {
          await firstValueFrom(this.authService.sync(user.id, discordResponse.USER_SPECIFIC.DISCORD_AVATAR, user.discordId, user.regimentId));
          
          user.avatar_url = discordResponse.USER_SPECIFIC.DISCORD_AVATAR;
          let returnUrl = discordResponse.USER_SPECIFIC.DISCORD_AVATAR;
          this.returnUrl(returnUrl)

          console.log("User avatar updated from Discord:", this.currentUser.avatar_url);
        }else{
          console.log("User avatar is already up to date.");
        }
      } catch (error) {
        console.error("Error updating user avatar from Discord:", error);
      }
    } 
  }

  returnUrl(returnUrl: any) {
    return returnUrl;
  }

  async checkAndUpdateUserAvatar(): Promise<void> {

    if (this.isLoggedIn && this.currentUser.discordId && this.currentUser.regimentId) {
      console.log("User:", this.currentUser)
      try {
        const regimentData = await firstValueFrom(this.regimentService.getRegiment(this.currentUser.regimentId));
        const discordResponse = await firstValueFrom(this.discordService.getUserGuildInfo(this.currentUser.discordId, regimentData.guild_id));
        
        console.log("Discord Response:", discordResponse);
  
        if (discordResponse.USER_SPECIFIC.DISCORD_AVATAR && this.currentUser.avatar_url !== discordResponse.USER_SPECIFIC.DISCORD_AVATAR) {
          await firstValueFrom(this.authService.profile(this.currentUser.id, this.currentUser.email, discordResponse.USER_SPECIFIC.DISCORD_AVATAR, this.currentUser.discordId, this.currentUser.regimentId));
          
          this.currentUser.avatar_url = discordResponse.USER_SPECIFIC.DISCORD_AVATAR;
          this.token.saveUser(this.currentUser);

          console.log("User avatar updated from Discord:", this.currentUser.avatar_url);
        }else{
          console.log("User avatar is already up to date.");
        }
      } catch (error) {
        console.error("Error updating user avatar from Discord:", error);
      }
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
    console.log('get access ran')
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;
    let userRegimentId = this.currentUser.regimentId;

    if (this.isLoggedIn) {

      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
        },
        (error) => {
          if (error.status === 403) {
            this.showUser = false;
            
            // 
          } else {
            
            console.error("Error:", error);
          }
        }
      );

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

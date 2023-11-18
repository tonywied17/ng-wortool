/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\regiment-settings\regiment-settings.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri November 17th 2023 4:54:55 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, TemplateRef } from "@angular/core";
import { RegimentService } from "../../_services/regiment.service";
import { DiscordService } from "src/app/_services/discord.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabGroup } from '@angular/material/tabs';
import { SharedDataService } from "src/app/_services/shared-data.service";


@Component({
  selector: "app-regiment-settings",
  templateUrl: "./regiment-settings.component.html",
  styleUrls: ["./regiment-settings.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class RegimentSettingsComponent implements OnInit, OnDestroy {
  @ViewChild("dialogTemplate")
  _dialogTemplate!: TemplateRef<any>;
  isLoaded: boolean = false;
  regimentSelected = true;
  regimentChannels: any;
  targetChannel: any;
  webhook: any;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
 

  constructor(
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService,
  ) {

  }

  /**
   * @method ngOnInit
   */
  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
  
      if (this.tabGroup.selectedIndex !== undefined) {
        console.log(this.sharedDataService.regimentSettingTabIndex);
        this.tabGroup.selectedIndex = this.sharedDataService.regimentSettingTabIndex;
        this.isLoaded = true;
      } else {
        console.log('None Index Found');
        this.tabGroup.selectedIndex = 0;
        this.isLoaded = true;
      }
  
      this.getRegiment();
    } catch (error) {
      console.error('Error initializing shared data:', error);
    }
  }
  
  ngAfterViewInit(): void {
    this.isLoaded = true;
  }
  
  /**
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.sharedDataService.regimentSettingTabIndex = undefined;
  }

  async retrieveInitialData(): Promise<void> {
    await Promise.all([this.getRegiment()]);
  }

  /**
   * @method getRegiment
   * @description Get the regiment data from the database
   * @returns {Promise<void>}
   */
  async getRegiment(): Promise<void> {
    await this.getRegimentChannels(this.sharedDataService.regiment.guild_id);
    this.regimentSelected = true;
  }

  /**
   * @method getRegimentChannels
   * @description Get the regiment channels from Discord
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   */
  async getRegimentChannels(guildId: string): Promise<void> {
    if (this.sharedDataService.regimentId) {
      await this.discordService
        .getGuildChannels(guildId)
        .toPromise()
        .then((response: any) => {
          this.regimentChannels = response.channels;
        });
    }
  }

  /**
   * @method updateTargetChannel
   * @description Update the target channel
   * @returns {Promise<void>}
   * @param selectedValue - The selected channel value
   */
  async updateTargetChannel(selectedValue: string): Promise<void> {
    this.targetChannel = selectedValue;

    setTimeout(async () => {
      await this.createWebhook(this.sharedDataService.regiment.guild_id, this.targetChannel);
    }, 300);
  }

  /**
   * @method createWebhook
   * @description Create a webhook
   * @returns {Promise<void>}
   * @param guildId - The Discord guild ID
   * @param channelId - The Discord channel ID
   */
  async createWebhook(guildId: string, channelId: string): Promise<void> {
    await this.discordService
      .createWebhook(guildId, channelId)
      .toPromise()
      .then((response: any) => {
        this.webhook = response;
        this.snackBar.open(
          `$Webhook created for channel ${this.targetChannel}!`,
          "Close",
          { duration: 3000 }
        );
        this.getRegiment();
      });
  }

  /**
   * @method updateRegiment
   * @description Update the regiment
   * @returns {Promise<void>}
   * @param regiment - The regiment name
   * @param guild_id - The Discord guild ID
   * @param guild_avatar - The Discord guild avatar
   * @param invite_link - The Discord invite link
   * @param website - The regiment website
   * @param description - The regiment description
   * @param side - The regiment side
   */
  async updateRegiment(): Promise<void> {
    if (this.sharedDataService.regimentId) {
      await this.regimentService
        .updateRegiment(
          this.sharedDataService.currentUser.id,
          this.sharedDataService.regimentId,
          this.sharedDataService.regiment.regiment,
          this.sharedDataService.regiment.guild_id,
          this.sharedDataService.regiment.guild_avatar,
          this.sharedDataService.regiment.invite_link,
          this.sharedDataService.regiment.website,
          this.sharedDataService.regiment.youtube,
          this.sharedDataService.regiment.description,
          this.sharedDataService.regiment.side
        )
        .toPromise()
        .then((response) => {
          this.snackBar.open(`Regiment Information Updated`, "Close", {
            duration: 3000,
          });
          this.getRegiment();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  

}



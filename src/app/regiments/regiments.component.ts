/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiments.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue August 1st 2023 12:13:58 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { RegimentService } from "../_services/regiment.service";
import { DiscordService } from "../_services/discord.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

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
  currentRoute!: string;

  constructor(
    private regimentService: RegimentService,
    private snackBar: MatSnackBar,
    private discordService: DiscordService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.getRegiments();
  }

  /**
   * Filter regiments by the search text
   * @returns void
   */
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

  /**
   * Get all regiments and their users
   * This function will get all regiments and then fetch the users for each regiment
   */
  getRegiments() {
    this.regimentService.getRegiments().subscribe((regiments) => {
      this.regiments = regiments;
      this.fetchRegimentUsers();
      //
    });
  }

  /**
   * Fetch all users for each regiment
   * @returns void
   */
  async fetchRegimentUsers(): Promise<void> {
    const fetchPromises = this.regiments.map((regiment: any) =>
      this.getRegimentUsers(regiment.id).then(() => {
        regiment.members = this.regimentUsers;
        return this.getDiscordRegimentData(regiment.guild_id, regiment);
      })
    );

    await Promise.all(fetchPromises);
  }

  /**
   * Get all users for a regiment by the regiment id
   * @param guildId - The guild id of the regiment
   */
  async getRegimentUsers(guildId: string): Promise<void> {
    await this.regimentService
      .getRegimentUsers(guildId)
      .toPromise()
      .then((response: any) => {
        this.regimentUsers = response;
      });
  }

  /**
   * Get the discord guild data for a regiment
   * This function will get the guild data for a regiment and then update the regiment data if it has changed
   * @param guildId - The guild id of the regiment
   * @param regiment - The regiment object
   */
  async getDiscordRegimentData(guildId: string, regiment: any): Promise<void> {
    await this.discordService
      .getRegimentGuild(guildId)
      .toPromise()
      .then((response: any) => {
        let hasChanged = false;

        if (
          !regiment.guild_avatar ||
          regiment.guild_avatar !== response.guild.iconURL
        ) {
          regiment.guild_avatar = response.guild.iconURL;
          hasChanged = true;
        }

        if (regiment.regiment !== response.guild.name) {
          regiment.regiment = response.guild.name;
          hasChanged = true;
        }

        if (hasChanged) {
          const requestedDomain = window.location.origin + this.currentRoute;
          this.regimentService
            .syncRegiment(
              requestedDomain,
              regiment.userId,
              regiment.id,
              regiment.regiment,
              regiment.guild_id,
              regiment.guild_avatar,
              regiment.invite_link,
              regiment.website,
              regiment.description,
              regiment.side
            )
            .subscribe(
              (updatedRegiment: any) => {},
              (error: any) => {}
            );
        }

        this.isDataLoaded = true;
      });
  }

  /**
   * Open a url in a new tab
   * @param url - The url to open
   */
  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

  /**
   * Display a snackbar message that the feature is not yet available
   */
  notYet() {
    this.snackBar.open("This feature is not yet available", "OK", {
      duration: 5000,
      verticalPosition: "top",
    });
  }
}

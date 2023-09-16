/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\board-moderator.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat September 16th 2023 6:23:29 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { Location } from "@angular/common";
import { RegimentService } from "../_services/regiment.service";

@Component({
  selector: "app-board-moderator",
  templateUrl: "./board-moderator.component.html",
  styleUrls: ["./board-moderator.component.scss"],
})
export class BoardModeratorComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showMod = false;
  showPage1 = false;
  showPage2 = false;
  showPage3 = false;
  loading = true;
  regimentData: any;
  regimentSelected = true;

  isOwner = false;

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private regimentService: RegimentService
  ) {}

  /**
   * on init
   */
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {

      this.authService.checkModeratorRole(userID, this.currentUser.regimentId).subscribe(
        (response) => {
          this.showMod = response.access;
          this.getRegiment();

          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            
          }
          this.loading = false;

        }
      );
    } else {
      this.loading = false;
    }

   
  }

  /**
   * Go back
   * This function is used to go back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * load content
   * This function is used to load the content for the page based on the page number
   * @param page - string - the page number
   */
  private loadContent(page: string): void {
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;
    if (page === "1") {
      this.showPage1 = true;
    } else if (page === "2") {
      this.showPage2 = true;
    } else if (page === "3") {
      this.showPage3 = true;
    }
  }

  /**
   * Get regiment
   * This function is used to get the regiment data
   */
  getRegiment() {
    let regimentId = this.currentUser.regimentId;

    if (regimentId) {
      this.regimentService.getRegiment(regimentId).subscribe((response) => {
        
        this.regimentData = response;
        this.regimentSelected = true;

        console.log(this.currentUser.discordId + ' - ' + this.regimentData.ownerId)
        
        if(this.regimentData.ownerId.includes(this.currentUser.discordId)) {
          this.isOwner = true;
        }else{
          this.isOwner = false;
        }

      });
    }else{
      this.regimentSelected = false;
    }
  }
}

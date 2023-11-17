/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-moderator\board-moderator.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri November 17th 2023 3:21:19 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { SharedDataService } from "src/app/_services/shared-data.service";

@Component({
  selector: "app-board-moderator",
  templateUrl: "./board-moderator.component.html",
  styleUrls: ["./board-moderator.component.scss"],
})
export class BoardModeratorComponent implements OnInit {
  content?: string;
  showPage1 = false;
  showPage2 = false;
  showPage3 = false;
  showPage4 = false
  loading = true;
  regimentSelected = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public sharedDataService: SharedDataService
  ) {}

  /**
   * on init
   */
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      // Processed
      if(this.sharedDataService.showMod){
        this.loading = false;
      }else{
        this.loading = true;
      }
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });
   
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
    this.showPage4 = false;
    if (page === "1") {
      this.showPage1 = true;
    } else if (page === "2") {
      this.showPage2 = true;
    } else if (page === "3") {
      this.showPage3 = true;
    } else if (page === "4") {
      this.showPage4 = true;
    }
  }

}

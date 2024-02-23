/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-user\board-user.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 23rd 2024 11:07:40 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { SharedDataService } from "src/app/_services/shared-data.service";

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  content?: string;
  showPage1 = false;
  showPage2 = false;
  showPage3 = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public sharedDataService: SharedDataService
  ) {}

  /**
   * On init
   */
  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      this.loading = false;
      // Processed
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });

    
  }

  /**
   * Load content
   * This function is used to load the content for the selected page
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
   * Go back
   * This function is used to go back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  
 
}

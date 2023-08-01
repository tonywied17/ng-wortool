/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-admin\board-admin.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:44:32 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import {
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { Location } from "@angular/common";

@Component({
  selector: "app-board-admin",
  templateUrl: "./board-admin.component.html",
  styleUrls: ["./board-admin.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BoardAdminComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;

  showPage1 = false;
  showPage2 = false;
  showPage3 = false;
  loading = true;

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  /**
   * Go back
   * This function is used to go back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * On init
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
      this.authService.checkAdminRole(userID).subscribe(
        (response) => {
          this.showAdmin = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showAdmin = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  /**
   * Load content
   * This function is used to load the content
   * @param page - string - the page
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
}

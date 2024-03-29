/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 4:48:57 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { TokenStorageService } from "./_services/token-storage.service";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, Event as NavigationEvent} from '@angular/router';
import { AuthService } from "./_services/auth.service";
import { SharedService } from "./_services/shared-service.service";
import { RegimentService } from "./_services/regiment.service";
import { VersionChecker } from "./version-checker";
import { RouteService } from "./_services/route-service.service";
import { SharedDataService } from "./_services/shared-data.service";
import { Location } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "paapp2";
  content?: string;
  currentUser: any;

  modRoute?: string;
  isLoaded:boolean = false;


  message = "";

  currentRoute!: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
    private tokenStorage: TokenStorageService,
    private versionChecker: VersionChecker,
    public routeService: RouteService,
    private location: Location,
    private regimentService: RegimentService,
    public sharedDataService: SharedDataService
  ) {
    this.versionChecker.listenForUpdates();
    this.authService.authenticationEvent.subscribe(() => {
      this.currentUser = this.tokenStorage.getUser();
    });

    this.currentRoute = "";
    this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {}
        if (event instanceof NavigationEnd) {
            this.currentRoute = event.url;          
        }

        if (event instanceof NavigationError) {}
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
   * On init
   */
  async ngOnInit(): Promise<void> {

    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      this.isLoaded = true;
      // Processed
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });
    
    
}


  menuOpen = false;

  /**
   * Toggle
   * This function is used to toggle the menu
   */
  toggle() {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * On activate event scroll to top
   * This function is used to scroll to top on activate event
   * @param event - scroll to top
   */
  onActivate(event: any) {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  /**
   * Logout
   * This function is used to logout
   */
  logout(): void {
    this.tokenStorage.signOut();
    this.authService.isAuthenticated = false;
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("isAdmin", "false");
    localStorage.setItem("isModerator", "false");

    this.sharedDataService.isLoggedIn = false;
    this.sharedDataService.showMod = false;
    this.sharedDataService.showAdmin = false;
    this.sharedDataService.showUser = false;
    this.sharedDataService.regiment = null;
    this.sharedDataService.regimentId = NaN;
    this.sharedDataService.currentUser = null;

    this.sharedService.triggerLogoutEvent();
    this.router.navigate(["/home"]);
  }

  /**
   * Scroll
   * This function is used to scroll to top
   */
  scroll() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  /**
   * Translate website
   * This function is used to translate the website
   * @param event - translate website
   */
  translateWebsite(event: any): void {
    const language = event.target.value;
    const url = `https://translate.google.com/translate?hl=en&sl=auto&tl=${language}&u=${window.location.href}`;
    window.open(url, '_blank');
  }
}
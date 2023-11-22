/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed November 22nd 2023 2:13:17 
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
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;
  isOwner: boolean = false;
  modRoute?: string;

  private roles: string[] = [];

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
    private regimentService: RegimentService
  ) {
    this.versionChecker.listenForUpdates();
    this.authService.authenticationEvent.subscribe(() => {
      this.initializeComponent();
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
  ngOnInit(): void {
    this.sharedService.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
            this.setRoleProperties();
        }
    });

    this.initializeComponent();
}

  private setRoleProperties(): void {
    const user = this.tokenStorage.getUser();
    this.roles = user.roles;

    this.showAdmin = this.roles.includes("ROLE_ADMIN");
    this.showMod = this.roles.includes("ROLE_MODERATOR");
    this.showUser = this.isLoggedIn;
}

  /**
   * Initialize component
   * This function is used to initialize the component
   */
  async initializeComponent(): Promise<void> {
    this.isLoggedIn = !!this.tokenStorage.getToken();
    this.currentUser = this.tokenStorage.getUser();
  
    if (this.isLoggedIn) {
      this.roles = this.tokenStorage.getUser().roles;
      this.showAdmin = this.roles.includes("ROLE_ADMIN");
      this.showMod = this.roles.includes("ROLE_MODERATOR");
      this.showUser = true;
    }
  
    const response = await this.regimentService
      .getRegiment(this.currentUser.regimentId)
      .toPromise();
    // console.log(response);
  
    if (response.ownerId === null) {
      this.isOwner = false;
      this.modRoute = "/mod/2";
    } else if (response.ownerId.includes(this.currentUser.discordId)) {
      this.isOwner = true;
      this.modRoute = "/mod/1";
    } else {
      this.isOwner = false;
      this.modRoute = "/mod/2";
    }
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
    this.isLoggedIn = this.authService.isAuthenticated;
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;
    this.showUser = this.authService.isAuthenticated;
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
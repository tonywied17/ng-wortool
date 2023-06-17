import { Component, OnInit } from "@angular/core";
import { TokenStorageService } from "./_services/token-storage.service";
import { Router } from "@angular/router";
import { AuthService } from "./_services/auth.service";
import { SharedService } from "./_services/shared.service";
import { VersionChecker } from './version-checker';
import { RouteService } from "./_services/route-service.service";
import { Location } from '@angular/common';

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
  private roles: string[] = [];

  message = "";

  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
    private tokenStorage: TokenStorageService,
    private versionChecker: VersionChecker,
    public routeService: RouteService,
    private location: Location
  ) {

    this.versionChecker.listenForUpdates();
    this.authService.authenticationEvent.subscribe(() => {
      this.initializeComponent();
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.initializeComponent();

    this.sharedService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;

      this.initializeComponent();
    });
  }

  initializeComponent(): void {
    if (this.tokenStorage.getToken()) {
      this.currentUser = this.tokenStorage.getUser();
      this.roles = this.tokenStorage.getUser().roles;
    }

    this.authService.isAuthenticated =
      localStorage.getItem("isAuthenticated") === "true";
    this.authService.isAdministrator =
      localStorage.getItem("isAdmin") === "true";
    this.authService.isModerator =
      localStorage.getItem("isModerator") === "true";

    this.isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;

    this.currentUser = this.tokenStorage.getUser();

    if (this.isLoggedIn) {
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      this.showAdmin = this.roles.includes("ROLE_ADMIN");
      this.showMod = this.roles.includes("ROLE_MODERATOR");
      this.showUser = true;
    }
  }

  menuOpen = false;

  toggle() {
    this.menuOpen = !this.menuOpen;
  }

  onActivate(event: any) {

    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

  }

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

  scroll() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}

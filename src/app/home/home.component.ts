/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:58:05 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { TokenStorageService } from "../_services/token-storage.service";
import { NavigationEnd, Router } from "@angular/router";
import { SharedService } from "../_services/shared.service";
import { PasswordMatchValidatorDirective } from "../password-match-validator.directive";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [PasswordMatchValidatorDirective],
})
export class HomeComponent implements OnInit {
  registerForm: any = {
    username: null,
    email: null,
    password: null,
  };

  loginForm: any = {
    username: null,
    password: null,
  };

  isSuccessful = false;
  isSignUpFailed = false;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = "";
  registerTask = false;
  loginTask = true;
  showAdmin = false;
  showUser = false;
  showMod = false;
  roles: string[] = [];
  currentUser: any;
  loading = true;

  currentYear!: number;
  nextYear!: number;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }

      const date = new Date();
      this.currentYear = date.getFullYear();
      this.nextYear = this.currentYear + 1;
    });
  }

  /**
   * Is authenticated
   * This function is used to check if the user is authenticated
   * @returns boolean
   */
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  /**
   * Is administrator
   * This function is used to check if the user is administrator
   * @returns boolean
   */
  get isAdministrator(): boolean {
    return this.authService.isAdministrator;
  }

  /**
   * Is moderator
   * This function is used to check if the user is moderator
   * @returns boolean
   */
  get isModerator(): boolean {
    return this.authService.isModerator;
  }

  /**
   * Counter
   * This function is used to create an array of numbers
   * @param i - number
   * @returns - array
   */
  counter(i: number) {
    return new Array(i);
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.initializeComponent();

    this.sharedService.logoutEvent$.subscribe(() => {
      this.initializeComponent();
    });

    this.sharedService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;

      this.initializeComponent();
    });
  }

  /**
   * initialize component
   * This function is used to initialize the component
   * @returns void
   */
  initializeComponent(): void {
    this.isLoggedIn = !!this.tokenStorage.getToken();
    this.currentUser = this.tokenStorage.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showUser = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );

      this.authService.checkModeratorRole(userID, this.currentUser.regimentId).subscribe(
        (response) => {
          this.showMod = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );

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
   * On register
   * This function is used to register a user
   */
  onRegister(): void {
    const { username, email, password } = this.registerForm;

    this.authService.register(username, email, password).subscribe({
      next: (data) => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      },
    });
  }

  /**
   * On login
   * This function is used to login a user
   */
  onLogin(): void {
    const { username, password } = this.loginForm;

    this.authService.login(username, password).subscribe({
      next: (data) => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.roles = this.tokenStorage.getUser().roles;

        this.isLoginFailed = false;
        this.authService.isAuthenticated = true;
        localStorage.setItem("isAuthenticated", "true");

        this.authService.isAdministrator = this.roles.includes("ROLE_ADMIN");
        localStorage.setItem(
          "isAdmin",
          this.roles.includes("ROLE_ADMIN") ? "true" : "false"
        );

        this.authService.isModerator = this.roles.includes("ROLE_MODERATOR");
        localStorage.setItem(
          "isModerator",
          this.roles.includes("ROLE_MODERATOR") ? "true" : "false"
        );

        this.isLoggedIn = this.authService.isAuthenticated;
        this.showUser = this.authService.isAuthenticated;
        this.showAdmin = this.authService.isAdministrator;
        this.showMod = this.authService.isModerator;

        this.authService.authenticationEvent.next();
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      },
    });
  }

  /**
   * Login btn
   * This function is used to show the login form
   */
  loginBtn(): void {
    this.loginTask = true;
    this.registerTask = false;
  }

  /**
   * Register btn
   * This function is used to show the register form
   */
  registerBtn(): void {
    this.loginTask = false;
    this.registerTask = true;
  }

  /**
   * Logout
   * This function is used to logout a user
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
    this.sharedService.setIsLoggedIn(false);

    this.router.navigate(["/home"]);
  }

  /**
   * Open portfolio
   * This function is used to open the portfolio in a new tab
   */
  openPortfolio() {
    window.open("https://tonewebdesign.com/portfolio", "_blank");
  }
}

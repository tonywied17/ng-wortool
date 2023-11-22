/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed November 22nd 2023 2:12:12 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { DatePipe } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NavigationEnd, Router } from "@angular/router";
import { SharedService } from 'src/app/_services/shared-service.service';
import { RegimentService } from 'src/app/_services/regiment.service';
import { PasswordMatchValidatorDirective } from 'src/app/password-match-validator.directive';
import { ChangeDetectorRef } from "@angular/core";
import { SteamApiService } from 'src/app/_services/steam-api.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [PasswordMatchValidatorDirective, DatePipe],
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
  gameDetails: any;
  screenshots: any;
  randomScreenshot: string = "";
  gameNews: any;
  headerImage: any;
  gameBackground: any;
  articleLength: any;
  latestAuthor: any;
  latestDate: any;

  isOwner: boolean = false;
  modRoute?: string;

  currentYear!: number;
  nextYear!: number;
  formattedDate!: string;

  columnLayout: string = "grid lg:grid-cols-[0.8fr_1.5fr_1fr] grid-cols-1 lg:gap-5";

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private sharedService: SharedService,
    private router: Router,
    private regimentService: RegimentService,
    private cdRef: ChangeDetectorRef,
    private datePipe: DatePipe,
    private steamApiService: SteamApiService
  ) {
    this.router.events.subscribe((event) => {
      const date = new Date();
      this.currentYear = date.getFullYear();
      this.nextYear = this.currentYear + 1;
    });
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
    this.formattedDate = this.datePipe.transform(new Date(), 'MM/d/yy h:mm a z', 'shortTime') as string;

    this.isLoggedIn = !!this.tokenStorage.getToken();


    this.currentUser = this.tokenStorage.getUser();

    if (!this.isLoggedIn) {
      this.initializeComponent();
    }

    this.sharedService.logoutEvent$.subscribe(() => {
      this.initializeComponent();
    });

    if (this.isLoggedIn) {
      this.sharedService.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        this.initializeComponent();
      });
    }
  }

  /**
   * initialize component
   * This function is used to initialize the component
   * @returns void
   */
  async initializeComponent(): Promise<void> {
    this.getScreenshots();
    this.getAppNews();
    this.isLoggedIn = !!this.tokenStorage.getToken();
    this.currentUser = this.tokenStorage.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn && this.currentUser) {
      try {
        const response = await this.regimentService.getRegiment(this.currentUser.regimentId).toPromise();
        if (response.ownerId !== null) {
          this.isOwner = response.ownerId.includes(this.currentUser.discordId);
        } else {
          this.isOwner = false;
        }
        this.modRoute = this.isOwner ? "/mod/1" : "/mod/2";
      } catch (error) {
        console.error("Error fetching regiment:", error);
      }
      

      this.authService.checkUserRole(userID).subscribe(
        (response) => {
          this.showUser = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showUser = false;
            
            // 
          } else {
            
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );

      this.authService
        .checkModeratorRole(userID, this.currentUser.regimentId)
        .subscribe(
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

    this.cdRef.detectChanges();
    
    // console.log("init component ran");
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
      next: async (data) => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.roles = data.roles; // Directly using the roles from the response
        console.log(data)
        this.currentUser.username = data.username;

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

        // Check if data exists and contains regimentId
        if (data && data.regimentId) {
          try {
            const response = await this.regimentService.getRegiment(data.regimentId).toPromise();
            if (response.ownerId === null) {
              this.isOwner = false;
              this.modRoute = "/mod/2";
            } else {
              this.isOwner = response.ownerId ? response.ownerId.includes(data.discordId) : false;
              this.modRoute = this.isOwner ? "/mod/1" : "/mod/2";
            }
          } catch (error) {
            console.error("Error fetching regiment:", error);
          }
        }
        
        
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      },
    });
  }

  /**
   * Get screenshots
   * This function is used to get the screenshots for the game from steam api
   * @returns - promise
   */
  async getScreenshots(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.steamApiService.getAppDetails().subscribe(
        (data) => {
          this.randomScreenshot = this.getRandomScreenshot(data.screenshots);
          this.headerImage = data.header_image;
          console.log(data)
          resolve();
        },
        (error) => {
          // handle error if needed
          reject(error);
        }
      );
    });
  }

  /**
   * Get random screenshot
   * This function is used to get a random screenshot from the screenshots array
   * @param screenshots - screenshots array
   * @returns - random screenshot url path
   */
  getRandomScreenshot(screenshots: any[]): string {
    if (screenshots && screenshots.length > 0) {
      const randomIndex = Math.floor(Math.random() * screenshots.length);
      return screenshots[randomIndex].path_thumbnail;
    }
    return "";
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


  /**
   * Get app news
   * This function is used to get the app news for the game from steam api
   */
  getAppNews(): void {
    this.steamApiService.getAppNews().subscribe(
      (data) => {
        this.gameNews = data;
        this.articleLength = this.gameNews.length;
        this.latestAuthor = this.gameNews[0].author;
        this.latestDate = this.formatUnixTimestamp(this.gameNews[0].date);
      },
      (error) => {
        // // console.log(error);
      }
    );
  }

  /**
   * Format unix timestamp
   * This function is used to format the unix timestamp from steam api
   * @param unixTimestamp - unix timestamp
   * @returns - formatted date
   */
  formatUnixTimestamp(unixTimestamp: any): string {
    const date = new Date(unixTimestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: undefined,
      minute: undefined,
      second: undefined,
      timeZone: "UTC",
    };

    return date.toLocaleString(undefined, options);
  }

  /**
   * Open in new popup window
   * This function is used to open a new window
   * @param url 
   * @param title 
   * @param w 
   * @param h 
   * @returns 
   */
  open(url: any, title: any, w: any, h: any) {
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  }
}
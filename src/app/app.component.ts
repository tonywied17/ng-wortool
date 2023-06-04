import { Component, OnInit } from "@angular/core";
import { TokenStorageService } from "./_services/token-storage.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { AuthService } from "./_services/auth.service";
import { SharedService } from "./_services/shared.service";

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
    private tokenStorage: TokenStorageService
  ) {
    // Subscribe to the authentication event
    this.authService.authenticationEvent.subscribe(() => {
      this.initializeComponent();
    });
  }

  ngOnInit(): void {
    this.initializeComponent();
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
    // alert(this.isLoggedIn);
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;

    console.log(this.isLoggedIn);
    this.currentUser = this.tokenStorage.getUser();

    if (this.isLoggedIn) {
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      console.log(user);
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
    // window.scroll(0,0);

    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    //or document.body.scrollTop = 0;
    //or document.querySelector('body').scrollTo(0,0)
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

    // Trigger the logout event
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

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

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get isAdministrator(): boolean {
    return this.authService.isAdministrator;
  }

  get isModerator(): boolean {
    return this.authService.isModerator;
  }

  counter(i: number) {
    return new Array(i);
  }

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

      this.authService.checkModeratorRole(userID).subscribe(
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

  loginBtn(): void {
    this.loginTask = true;
    this.registerTask = false;
  }

  registerBtn(): void {
    this.loginTask = false;
    this.registerTask = true;
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
    this.sharedService.setIsLoggedIn(false);

    this.router.navigate(["/home"]);
  }

  openPortfolio() {
    window.open("https://tonewebdesign.com/portfolio", "_blank");
  }
}

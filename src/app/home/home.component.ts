import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { NavigationEnd, Router } from '@angular/router';
import { SharedService } from '../_services/shared.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  registerForm: any = {
    username: null,
    email: null,
    password: null
  };

  loginForm: any = {
    username: null,
    password: null
  };

  isSuccessful = false;
  isSignUpFailed = false;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  registerTask = false;
  loginTask = true;
  showAdmin = false;
  showUser = false;
  showMod = false;
  roles: string[] = [];
  currentUser: any;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private sharedService: SharedService,
    private router: Router
  ) {
    // Subscribe to router events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
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
      // Run the initializer when the logout event occurs
      this.initializeComponent();
    });

    this.sharedService.isLoggedIn$.subscribe(isLoggedIn => {
      // Update the isLoggedIn property in the AppComponent
      this.isLoggedIn = isLoggedIn;
  
      // Run the initializer or perform any necessary actions
      this.initializeComponent();
    });
  }


  initializeComponent(): void {
    if (this.tokenStorage.getToken()) {
      this.currentUser = this.tokenStorage.getUser();
      this.roles = this.tokenStorage.getUser().roles;
    }

    this.authService.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    this.authService.isAdministrator = localStorage.getItem('isAdmin') === 'true';
    this.authService.isModerator = localStorage.getItem('isModerator') === 'true';

    this.isLoggedIn = this.authService.isAuthenticated;
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;
  

    console.log(this.isLoggedIn);
    this.currentUser = this.tokenStorage.getUser();

    if (this.isLoggedIn) {
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      console.log(user);
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      this.showMod = this.roles.includes('ROLE_MODERATOR');
      this.showUser = true;
    }
  }


  onRegister(): void {
    const { username, email, password } = this.registerForm;

    this.authService.register(username, email, password).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  onLogin(): void {
    const { username, password } = this.loginForm;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.roles = this.tokenStorage.getUser().roles;


        this.isLoginFailed = false;
        this.authService.isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true'); // Store the authentication status

        this.authService.isAdministrator = this.roles.includes('ROLE_ADMIN');
        localStorage.setItem('isAdmin', this.roles.includes('ROLE_ADMIN') ? 'true' : 'false'); // Store the admin status

        this.authService.isModerator = this.roles.includes('ROLE_MODERATOR');
        localStorage.setItem('isModerator', this.roles.includes('ROLE_MODERATOR') ? 'true' : 'false'); // Store the moderator status  

        this.isLoggedIn = this.authService.isAuthenticated;
        this.showUser = this.authService.isAuthenticated;
        this.showAdmin = this.authService.isAdministrator
        this.showMod = this.authService.isModerator;

        this.authService.authenticationEvent.next();

      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
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
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.setItem('isAdmin', 'false');
    localStorage.setItem('isModerator', 'false');
    this.isLoggedIn = this.authService.isAuthenticated;
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;
    this.showUser = this.authService.isAuthenticated;
  
    // Trigger the logout event
    this.sharedService.triggerLogoutEvent();

    this.sharedService.setIsLoggedIn(false);
  
    this.router.navigate(['/home']);
  }

}

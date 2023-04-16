import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private router: Router) { }

  counter(i: number) {
    return new Array(i);
  }


  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
      this.roles = this.tokenStorage.getUser().roles;
    }

    this.isLoggedIn = !!this.tokenStorage.getToken();
    this.currentUser = this.tokenStorage.getUser();

    if (this.isLoggedIn) {
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      console.log(user)
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      this.showMod = this.roles.includes('ROLE_MODERATOR');
      this.showUser = true
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

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
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
    this.router.navigate(['/home']);
    setTimeout(() => {
      window.location.reload();
    }, 10);

  }

}

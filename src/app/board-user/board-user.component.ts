import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from '../_services/auth.service';
import { SharedService } from '../_services/shared.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.scss']
})
export class BoardUserComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;

  showPage1 = false;
  showPage2 = false;
  showPage3 = false;

  private roles: string[] = [];

  passwordCurrent: string = '';
  passwordNew: string = '';
  passwordNewConfirm: string = '';

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const page = params['page'];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      const userID = this.currentUser.id;
      
      if (this.isLoggedIn) {
        this.authService.checkUserRole(userID).subscribe(
          (response) => {
            console.log('User Role:', response.access);
            this.showUser = response.access;
          },
          (error) => {
            if (error.status === 403) {
              console.log('Unauthorized');
              this.showUser = false;
              console.log('User Role:', this.showUser);
              // Handle unauthorized error, display login message, etc.
            } else {
              console.error('Error:', error);
            }
          }
        );
      }
  }

  private loadContent(page: string): void {
    // Reset all flags
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;

    // Set the flag based on the 'page' parameter
    if (page === '1') {
      this.showPage1 = true;
    } else if (page === '2') {
      this.showPage2 = true;
    } else if (page === '3') {
      this.showPage3 = true;
    }
  }

  async updatePassword() {
    if (
      !this.passwordCurrent ||
      !this.passwordNew ||
      !this.passwordNewConfirm
    ) {
      this.showSnackBar('Please fill in all the fields.');
      return;
    }

    if (this.passwordNew.length < 6) {
      this.showSnackBar('New password must be at least 6 characters long.');
      return;
    }
  
    if (this.passwordNew !== this.passwordNewConfirm) {
      this.showSnackBar('New passwords do not match!');
      return;
    }
  
    const userId = this.currentUser.id;
  
    try {
      await this.authService.password(userId, this.passwordCurrent, this.passwordNew).toPromise();
      this.showSnackBar('Password updated successfully!');
      this.passwordCurrent = '';
      this.passwordNew = '';
      this.passwordNewConfirm = '';
      this.logout();
    } catch (error: any) {
      this.showSnackBar(error.message);
    }
  }

  logout(): void {
    this.token.signOut();
    this.authService.isAuthenticated = false;
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.setItem('isAdmin', 'false');
    localStorage.setItem('isModerator', 'false');
    this.isLoggedIn = this.authService.isAuthenticated;
    this.showMod = this.authService.isModerator;
    this.showAdmin = this.authService.isAdministrator;
    this.showUser = this.authService.isAuthenticated;
  
    this.sharedService.triggerLogoutEvent();

    this.sharedService.setIsLoggedIn(false);
  
    this.router.navigate(['/home']);
  }


  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      verticalPosition: 'top'
    });
  }
}

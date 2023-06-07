import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.scss']
})
export class BoardAdminComponent implements OnInit {
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

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute, ) { }

    ngOnInit(): void {
      this.route.params.subscribe((params: Params) => {
        const page = params['page'];
        this.loadContent(page);
      });
    
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      const userID = this.currentUser.id;
      
      if (this.isLoggedIn) {
        this.authService.checkAdminRole(userID).subscribe(
          (response) => {
            console.log('Admin Role:', response.access);
            this.showAdmin = response.access;
          },
          (error) => {
            if (error.status === 403) {
              console.log('Unauthorized');
              this.showAdmin = false;
              console.log('Admin Role:', this.showAdmin);
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
}

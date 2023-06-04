import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

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

  constructor(private token: TokenStorageService,private route: ActivatedRoute,) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      const page = params['page'];
      this.loadContent(page);
    });


    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      // console.log(user)
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      this.showMod = this.roles.includes('ROLE_MODERATOR');
      this.showUser = true
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

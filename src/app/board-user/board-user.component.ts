import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.scss']
})
export class BoardUserComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdminFeed = false;
  showUserFeed = false;
  showModFeed = false;
  
  private roles: string[] = [];
  

  message = '';

  constructor(
    private userService: UserService, 
    private  token: TokenStorageService, 
    ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      console.log(user)
      this.showAdminFeed = this.roles.includes('ROLE_ADMIN');
      this.showModFeed = this.roles.includes('ROLE_MODERATOR');
      this.showUserFeed = true
    }

    

  }


}

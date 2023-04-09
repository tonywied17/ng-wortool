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
  showAdminControls = false;
  showUserFeed = false;
  private roles: string[] = [];
  

  message = '';

  constructor(
    private userService: UserService, 
    private tokenStorage: TokenStorageService, 
    ) { }

  ngOnInit(): void {


    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
      this.roles = this.tokenStorage.getUser().roles;
      console.log(this.currentUser)
    }

    if (this.isLoggedIn) {

      this.showUserFeed = true;

    }

  }


}

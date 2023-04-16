import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  showAdmin = false;
  showUser = false;
  showMod = false;

  private roles: string[] = [];
  

  message = '';

  constructor(
    private  token: TokenStorageService, 
    ) { }

    
    ngOnInit(): void {
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
  
      if (this.isLoggedIn) {
        const user = this.token.getUser();
        this.roles = user.roles;
        console.log(user)
        this.showAdmin = this.roles.includes('ROLE_ADMIN');
        this.showMod = this.roles.includes('ROLE_MODERATOR');
        this.showUser = true
      }
  
    }

}

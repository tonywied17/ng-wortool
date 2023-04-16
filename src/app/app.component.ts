import { Component, OnInit } from '@angular/core';
import { UserService } from './_services/user.service';
import { TokenStorageService } from './_services/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'paapp2';
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;

  private roles: string[] = [];
  

  message = '';

  constructor(
    private userService: UserService, 
    private router: Router, 
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
  menuOpen = false;

  toggle() {
    this.menuOpen = !this.menuOpen
  }

  onActivate(event: any) {
    // window.scroll(0,0);

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    //or document.body.scrollTop = 0;
    //or document.querySelector('body').scrollTo(0,0)

  }

  logout(): void {
    this.token.signOut();
    this.router.navigate(['/home']);
    setTimeout(() => {
      window.location.reload();
    }, 10);

  }

  scroll() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}

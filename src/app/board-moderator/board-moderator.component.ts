import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from '@angular/router';
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";

@Component({
  selector: "app-board-moderator",
  templateUrl: "./board-moderator.component.html",
  styleUrls: ["./board-moderator.component.scss"],
})
export class BoardModeratorComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showMod = false;
  showPage1 = false;
  showPage2 = false;
  loading = true;
  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    ) {}

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      const page = params['page'];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkModeratorRole(userID).subscribe(
        (response) => {
          
          this.showMod = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            console.error('Error:', error);
          }
          this.loading = false;
        }
      );
    }else{
      this.loading = false;
    }
  }

  private loadContent(page: string): void {
    this.showPage1 = false;
    this.showPage2 = false;

    if (page === '1') {
      this.showPage1 = true;
    } else if (page === '2') {
      this.showPage2 = true;
    }
  }
}

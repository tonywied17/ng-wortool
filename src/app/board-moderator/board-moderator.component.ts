import { Component, OnInit } from "@angular/core";
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
  private roles: string[] = [];

  constructor(
    private token: TokenStorageService,
    private authService: AuthService
    ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkModeratorRole(userID).subscribe(
        (response) => {
          console.log('Mod Role:', response.access);
          this.showMod = response.access;
        },
        (error) => {
          if (error.status === 403) {
            console.log('Unauthorized');
            this.showMod = false;
            console.log('Mod Role:', this.showMod);
            // Handle unauthorized error, display login message, etc.
          } else {
            console.error('Error:', error);
          }
        }
      );
    }
  }
}

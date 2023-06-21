import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { Location } from "@angular/common";
import { RegimentService } from "../_services/regiment.service";

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
  regimentData: any;
  regimentSelected = true;

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private regimentService: RegimentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkModeratorRole(userID).subscribe(
        (response) => {
          this.showMod = response.access;
          this.getRegiment();
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }

  private loadContent(page: string): void {
    this.showPage1 = false;
    this.showPage2 = false;

    if (page === "1") {
      this.showPage1 = true;
    } else if (page === "2") {
      this.showPage2 = true;
    }
  }

  getRegiment() {
    let regimentId = this.currentUser.regimentId;

    if (regimentId) {
      this.regimentService.getRegiment(regimentId).subscribe((response) => {
        console.log(response);
        this.regimentData = response;
        this.regimentSelected = true;
      });
    }else{
      this.regimentSelected = false;
    }
  }
}

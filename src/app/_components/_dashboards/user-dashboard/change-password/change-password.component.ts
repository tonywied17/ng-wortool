import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/_services/auth.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthInjectionServiceService } from "src/app/_services/auth-injection-service.service";
import { SharedDataService } from "src/app/_services/shared-data.service";


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private sharedDataService: SharedDataService,
    private token: TokenStorageService,
    private sharedService: AuthInjectionServiceService,
  ) { }

  public isLoaded = false;
  passwordCurrent: string = "";
  passwordNew: string = "";
  passwordNewConfirm: string = "";


  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([]);
      this.isLoaded = true;
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }


  async updatePassword() {
    if (
      !this.passwordCurrent ||
      !this.passwordNew ||
      !this.passwordNewConfirm
    ) {
      this.showSnackBar("Please fill in all the fields.");
      return;
    }

    if (this.passwordNew.length < 6) {
      this.showSnackBar("New password must be at least 6 characters long.");
      return;
    }

    if (this.passwordNew !== this.passwordNewConfirm) {
      this.showSnackBar("New passwords do not match!");
      return;
    }

    const userId = this.sharedDataService.currentUser.id;
    try {
      await this.authService
        .password(userId, this.passwordCurrent, this.passwordNew)
        .toPromise();
      this.showSnackBar("Password updated successfully!");
      this.passwordCurrent = "";
      this.passwordNew = "";
      this.passwordNewConfirm = "";
      this.logout();
    } catch (error: any) {
      if (error.status === 401) {
        this.showSnackBar("Current password doesn't match!");
      } else {
        this.showSnackBar("An error occurred while updating the password.");
      }
    }
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  logout(): void {
    this.token.signOut();
    this.authService.isAuthenticated = false;
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("isAdmin", "false");
    localStorage.setItem("isModerator", "false");
    this.sharedDataService.isLoggedIn = this.authService.isAuthenticated;
    this.sharedDataService.showMod = this.authService.isModerator;
    this.sharedDataService.showAdmin = this.authService.isAdministrator;
    this.sharedDataService.showUser = this.authService.isAuthenticated;
    this.sharedService.triggerLogoutEvent();
    this.sharedService.setIsLoggedIn(false);

    this.sharedDataService.isLoggedIn = false;
    this.sharedDataService.showMod = false;
    this.sharedDataService.showAdmin = false;
    this.sharedDataService.showUser = false;
    this.sharedDataService.regiment = null;
    this.sharedDataService.regimentId = NaN;
    this.sharedDataService.currentUser = null;

    this.router.navigate(["/home"]);
  }

}

import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { AuthService } from "src/app/_services/auth.service";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from "../../../confirm-cancel-snackbar/confirm-cancel-snackbar.component";
import { AuthInjectionServiceService } from "src/app/_services/auth-injection-service.service";
import { SharedDataService } from "src/app/_services/shared-data.service";

@Component({
  selector: 'app-favorite-maps',
  templateUrl: './favorite-maps.component.html',
  styleUrl: './favorite-maps.component.scss'
})
export class FavoriteMapsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService,
    private token: TokenStorageService,
    private sharedService: AuthInjectionServiceService,
  ) { }

  public isLoaded = false;
  
  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([]);
      this.isLoaded = true;
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

}

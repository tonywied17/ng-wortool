import { Component, OnInit, ViewChild, ChangeDetectorRef  } from "@angular/core";
import { WeaponService } from "../_services/weapon.service";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";

@Component({
  selector: "app-weapons",
  templateUrl: "./weapons.component.html",
  styleUrls: ["./weapons.component.scss"],
})
export class WeaponsComponent implements OnInit {


  weaponForm: any = {
    weapon: null,
    type: null,
    range: null,
    lengthy: null,
    ammo: null,
    image: null,
    notes: null,
  };

  errorMessage = "";
  weaponsObj: any;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  loading = true;
  submitted = false;
  spotlight: any;

  constructor(
    private weaponService: WeaponService,
    private token: TokenStorageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkAdminRole(userID).subscribe(
        (response) => {
          
          this.showAdmin = response.access;
          this.loading = false;
        },
        (error) => {
          if (error.status === 403) {
            this.showAdmin = false;           
          } else {
            console.error('Error:', error);
            if(this.isLoggedIn) {
              this.loading = false;
            }
          }
          this.loading = false;
        }
      );
    }else{
      this.loading = false;
    }

    this.weaponService.getAll().subscribe((data) => {
      this.weaponsObj = JSON.parse(data);
    });
  }



  loadWeapon(weapon: any) {
    this.spotlight = null;
    setTimeout(() => {
      this.spotlight = weapon;
    }, 0);
  }

  open(url: any, title: any, w: any, h: any) {
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  }

}


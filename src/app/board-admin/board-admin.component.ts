import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TokenStorageService } from "../_services/token-storage.service";
import { AuthService } from "../_services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { WeaponService } from "../_services/weapon.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-board-admin",
  templateUrl: "./board-admin.component.html",
  styleUrls: ["./board-admin.component.scss"],
})
export class BoardAdminComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;

  showPage1 = false;
  showPage2 = false;
  showPage3 = false;
  loading = true;

  weaponName: string = "";
  weaponType: string = "";
  weaponRange: string = "";
  weaponLength: string = "";
  weaponAmmo: string = "";
  weaponImage: string = "";
  weaponNotes: string = "";

  weaponsList!: any[];
  selectedWeaponId: any;

  isCreating = false;
  isUpdating = false;

  constructor(
    private token: TokenStorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private weaponService: WeaponService
  ) {}

  ngOnInit(): void {
    this.loadWeapons();

    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

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
            console.error("Error:", error);
          }
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  loadWeapons(): void {
    this.weaponService.getAll().subscribe(
      (data: any) => {
        this.weaponsList = JSON.parse(data);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  handleSelectionChange() {
    if (this.selectedWeaponId) {
      const selectedIndex = this.weaponsList.findIndex(
        (weapon) => weapon.id === parseInt(this.selectedWeaponId)
      );

      console.log(selectedIndex);
      if (selectedIndex !== -1) {
        const selectedWeapon = this.weaponsList[selectedIndex];
        console.log(selectedWeapon);
        this.weaponName = selectedWeapon.weapon;
        this.weaponType = selectedWeapon.type;
        this.weaponRange = selectedWeapon.range;
        this.weaponLength = selectedWeapon.lengthy;
        this.weaponAmmo = selectedWeapon.ammo;
        this.weaponImage = selectedWeapon.image;
        this.weaponNotes = selectedWeapon.notes;
        this.isCreating = false;
        this.isUpdating = true;
      }
    }
  }

  createNew() {
    this.weaponName = "";
    this.weaponType = "";
    this.weaponRange = "";
    this.weaponLength = "";
    this.weaponAmmo = "";
    this.weaponImage = "";
    this.weaponNotes = "";
    this.selectedWeaponId = "";
    this.isCreating = true;
    this.isUpdating = false;
  }

  private loadContent(page: string): void {
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;

    if (page === "1") {
      this.showPage1 = true;
    } else if (page === "2") {
      this.showPage2 = true;
    } else if (page === "3") {
      this.showPage3 = true;
    }
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  async createOrUpdateWeapon() {
    if (!this.weaponName || !this.weaponType) {
      this.showSnackBar("Please fill in at least the weapon name & type.");
      return;
    }
  
    let userId = this.currentUser.id;
  
    try {
      const response: any = await firstValueFrom(
        this.weaponService.createOrUpdate(
          userId,
          this.weaponName,
          this.weaponType,
          this.weaponRange,
          this.weaponLength,
          this.weaponAmmo,
          this.weaponImage,
          this.weaponNotes
        )
      );
      if (response && response.message) {
        this.showSnackBar(response.message);
      } else {
        this.showSnackBar("Weapon updated successfully!");
      }
    } catch (error: any) {
      this.showSnackBar("An error occurred while updating the weapon.");
    }

    this.loadWeapons();
  }
  
  deleteWeapon() {

    let userId = this.currentUser.id;

    if (this.selectedWeaponId) {
      const selectedIndex = this.weaponsList.findIndex(
        (weapon) => weapon.id === parseInt(this.selectedWeaponId)
      );

      console.log(selectedIndex);
      if (selectedIndex !== -1) {
        const selectedWeapon = this.weaponsList[selectedIndex];
        console.log(selectedWeapon);
        this.weaponService.delete(userId, selectedWeapon.id).subscribe(
          (response) => {
            console.log(response);
            this.showSnackBar("Weapon deleted successfully!");
            this.loadWeapons();
            this.createNew();
            this.isCreating = false;
          },
          (error) => {
            console.error(error);
            this.showSnackBar("An error occurred while deleting the weapon.");
          }
        );
      }
    }
  }
}

import { Component, OnInit, ViewChild } from "@angular/core";
import { WeaponService } from "../_services/weapon.service";
import { TokenStorageService } from "../_services/token-storage.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-weapons",
  templateUrl: "./weapons.component.html",
  styleUrls: ["./weapons.component.scss"],
})
export class WeaponsComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "weapon",
    "range",
    "length",
    "ammo",
    "notes",
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatSort) sort!: MatSort;

  weaponForm: any = {
    weapon: null,
    range: null,
    lengthy: null,
    ammo: null,
    notes: null,
  };
  errorMessage = "";
  weaponsObj: any;

  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  private roles: string[] = [];
  submitted = false;

  constructor(
    private weaponService: WeaponService,
    private token: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      console.log(user);
      this.showAdmin = this.roles.includes("ROLE_ADMIN");
    }

    this.weaponService.getAll().subscribe((data) => {
      this.weaponsObj = JSON.parse(data);

      this.weaponsObj.forEach((gun: any) => {
        console.log(gun.weapon);
      });

      this.dataSource = new MatTableDataSource(this.weaponsObj);
      this.dataSource.sort = this.sort;
    });
  }

  onCreate(): void {
    const { weapon, range, lengthy, ammo, notes } = this.weaponForm;

    const data = {
      weapon: this.weaponForm.weapon,
      range: this.weaponForm.range,
      lengthy: this.weaponForm.lengthy,
      ammo: this.weaponForm.ammo,
      notes: this.weaponForm.notes,
    };

    this.weaponService.create(data)
    .subscribe({
      next: (data) => {
        console.log(data);
        this.submitted = true;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }
}

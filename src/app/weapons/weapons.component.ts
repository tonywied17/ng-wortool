import { Component, OnInit, ViewChild, ChangeDetectorRef  } from "@angular/core";
import { WeaponService } from "../_services/weapon.service";
import { TokenStorageService } from "../_services/token-storage.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { AuthService } from "../_services/auth.service";

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
          console.log('Admin Role:', response.access);
          this.showAdmin = response.access;
        },
        (error) => {
          if (error.status === 403) {
            console.log('Unauthorized');
            this.showAdmin = false;
            console.log('Admin Role:', this.showAdmin);
            // Handle unauthorized error, display login message, etc.
          } else {
            console.error('Error:', error);
          }
        }
      );
    }

    this.weaponService.getAll().subscribe((data) => {
      this.weaponsObj = JSON.parse(data);

      this.weaponsObj.forEach((gun: any) => {
        // console.log(gun.weapon);
      });

      this.dataSource = new MatTableDataSource(this.weaponsObj);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.pageSize = 8;
      this.dataSource.paginator.pageIndex = 0;
    });
  }

  onCreate(): void {
    const userID = this.currentUser.id;
    const data = {
      weapon: this.weaponForm.weapon,
      range: this.weaponForm.range,
      lengthy: this.weaponForm.lengthy,
      ammo: this.weaponForm.ammo,
      notes: this.weaponForm.notes,
    };
  
    this.weaponService.create(userID, data).subscribe({
      next: (data) => {
        // console.log(data);
        this.submitted = true;
        this.cdr.detectChanges();
        this.refreshTable(); // Refresh table after creating the weapon
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }
  


  refreshTable(): void {
    this.weaponService.getAll().subscribe((data) => {
      this.weaponsObj = JSON.parse(data);

      this.dataSource = new MatTableDataSource(this.weaponsObj);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.pageSize = 6;
      this.dataSource.paginator.pageIndex = 0;
    });
  }


  resetForm() {
    this.submitted = false;
    this.submitted = false;
    this.weaponForm.weapon = null;
    this.weaponForm.range = null;
    this.weaponForm.lengthy = null;
    this.weaponForm.ammo = null;
    this.weaponForm.notes = null;
  }
}

import { Component, OnInit } from "@angular/core";
import { RegimentService } from "../_services/regiment.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map } from "rxjs/operators";

@Component({
  selector: "app-regiments",
  templateUrl: "./regiments.component.html",
  styleUrls: ["./regiments.component.scss"],
})
export class RegimentsComponent implements OnInit {
  regiments: any;
  regimentUsers: any;
  regimentID: any;
  searchText: any;

  constructor(
    private regimentService: RegimentService,
    private snackBar: MatSnackBar
    
    ) {}

  ngOnInit(): void {
    this.getRegiments();
  }

  filterRegiments() {
    this.regimentService
      .getRegiments()
      .pipe(
        map((regiments) =>
          regiments.filter((regiment: any) => {
            return regiment.regiment
              .toLowerCase()
              .includes(this.searchText.toLowerCase());
          })
        )
      )
      .subscribe((filteredRegiments) => {
        this.regiments = filteredRegiments;
      }); 
  }

  getRegiments() {
    this.regimentService.getRegiments().subscribe((regiments) => {
      this.regiments = regiments;
      this.fetchRegimentUsers();
      console.log(this.regiments);
    });
  }
  
  async fetchRegimentUsers(): Promise<void> {
    for (const regiment of this.regiments) {
      await this.getRegimentUsers(regiment.id).then(() => {
        regiment.members = this.regimentUsers;
        console.log(regiment);
      });
    }
  }

  async getRegimentUsers(guildId: string): Promise<void> {
    await this.regimentService
      .getRegimentUsers(guildId)
      .toPromise()
      .then((response: any) => {
        console.log(response);
        this.regimentUsers = response;
      });
  }
  

  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

  // mat snackbar for popup message

  notYet(){
    this.snackBar.open("This feature is not yet available", "OK", {
      duration: 5000,
      verticalPosition: "top",
    });
  }
}

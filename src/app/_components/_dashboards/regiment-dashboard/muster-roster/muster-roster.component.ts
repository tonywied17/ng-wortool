import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { MusterUserService } from "src/app/_services/muster-user.service";


interface Role {
  id: string;
  name: string;
  color: number;
}

@Component({
  selector: 'app-muster-roster',
  templateUrl: './muster-roster.component.html',
  styleUrls: ['./muster-roster.component.scss']
})


export class MusterRosterComponent implements OnInit {
  isDataLoaded: boolean = false;
  enlister: boolean = false;
  musterUsers: any[] = [];

  constructor(
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService,
    private musterUserService: MusterUserService
  ) {}

  async ngOnInit(): Promise<void> {
    this.sharedDataService.retrieveInitialData()
    .then(() => {
      // Data has been initialized
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });

    this.musterUserService.getAll(1).subscribe(data => {
      console.log(data);
    });
  }


  enlistUsers(){
    this.enlister = true;
  }

  getAllMusterUsers() {
    this.musterUserService.getAll(this.sharedDataService.regimentId).subscribe(data => {
      console.log(data)
      this.musterUsers = data;
    });
  }

  updateMusterUser(user: any) {
    this.musterUserService.update(user).subscribe(response => {
      console.log('Update Response:', response);
    });
  }

  incrementEvents(user: any) {
    const data = { discordId: user.discordId, regimentId: user.regimentId };
    this.musterUserService.incrementEvents(data).subscribe(response => {
      console.log('Increment Events Response:', response);
    });
  }

  incrementDrills(user: any) {
    const data = { discordId: user.discordId, regimentId: user.regimentId };
    this.musterUserService.incrementDrills(data).subscribe(response => {
      console.log('Increment Drills Response:', response);
    });
  }


}

import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SharedDataService } from "src/app/_services/shared-data.service";


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

  constructor(
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService
  ) {}

  async ngOnInit(): Promise<void> {
    this.sharedDataService.retrieveInitialData()
    .then(() => {
      // Data has been initialized
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });
  }


  enlistUsers(){
    this.enlister = true;
  }


}

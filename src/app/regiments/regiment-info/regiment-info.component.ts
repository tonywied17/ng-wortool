import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { RegimentService } from "../../_services/regiment.service";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-regiment-info',
  templateUrl: './regiment-info.component.html',
  styleUrls: ['./regiment-info.component.scss']
})
export class RegimentInfoComponent implements OnInit {
  regiment: any;
  regimentUsers: any;
  regimentID: any;
  isDataLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private regimentService: RegimentService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const id = params["id"];
      this.regimentID = id;
      this.retrieveInitialData();
    });
  }

  async retrieveInitialData(): Promise<void> {
    await Promise.all([
      this.getRegiment(this.regimentID),
      this.fetchRegimentUsers()
    ]);

    this.isDataLoaded = true;
  }

  async getRegiment(id: any): Promise<void> {
    this.regiment = await firstValueFrom(this.regimentService.getRegiment(id));
    console.log(this.regiment);
  }

  async fetchRegimentUsers(): Promise<void> {
    this.regimentUsers = await firstValueFrom(this.regimentService.getRegimentUsers(this.regimentID));
    this.regiment.members = this.regimentUsers;
    console.log(this.regiment);
  }

  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }
}

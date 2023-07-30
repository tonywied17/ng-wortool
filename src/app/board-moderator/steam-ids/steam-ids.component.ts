import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { SteamApiService } from "src/app/_services/steam-api.service";
import { TokenStorageService } from "../../_services/token-storage.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-steam-ids",
  templateUrl: "./steam-ids.component.html",
  styleUrls: ["./steam-ids.component.scss"],
})
export class SteamIdsComponent implements OnInit {
  steamIdForm!: FormGroup;
  isLoggedIn = false;
  currentUser: any;
  regimentID: any;
  regimentData: any;
  regimentSelected = true;
  steamIds: any;
  addString: string = "<i class='fa-solid fa-plus mr-1'></i> Add Steam ID";
  gameIdForm: any;
  addingSteam: boolean = false;
  previewData: any;
  searchText: string = "";

  isDataLoaded = false;

  itemsPerPage = 3;
  currentPage = 1;
  paginatedSteamIds: any[] = [];
  allSteamIds: any[] = [];


  constructor(
    private token: TokenStorageService,
    private regimentService: RegimentService,
    private authService: AuthService,
    private steamApiService: SteamApiService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {

    this.steamIdForm = this.formBuilder.group({
      gameIdForm: ["", [Validators.required, Validators.pattern(/^.{17}$/)]],
    });

    try {
      this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      const userID = this.currentUser.id;
      if (this.isLoggedIn) {
        await firstValueFrom(
          this.authService.checkModeratorRole(
            userID,
            this.currentUser.regimentId
          )
        );
        if (this.currentUser.regimentId) {
          this.regimentID = this.currentUser.regimentId;
          await this.getRegiment();
          await this.getSteamIds();
          this.allSteamIds = this.steamIds.slice(); // Store the initial data in allSteamIds

          console.log(this.steamIds);
          console.log(this.allSteamIds);
        }
      }
    } catch (error: any) {
      if (error && error.status === 403) {
        this.regimentSelected = false;
      } else {
        console.error("Error:", error);
      }
    } finally {
      this.isDataLoaded = true;
    }
  }

  getValue(steamId: any, key: string) {
    const stat = steamId.liveGameStats.find((item: { name: string; }) => item.name === key);
    return stat ? stat.value : 'N/A';
  }
  
  getStatValue(stats: any[], name: any) {
    const stat = stats.find((s: { name: any; }) => s.name === name);
    return stat ? stat.value : null;
  }
  
  getGameType(name: any) {
    switch (name) {
      case 'STAT_GAMES_PLAYED_SKIRMISH':
        return "Skirmish's";
      case 'STAT_GAMES_PLAYED_CONQUEST':
        return "Conquest's";
      case 'STAT_GAMES_PLAYED_PICKETPATROL':
        return "Picket Patrol's";
      case 'STAT_GAMES_PLAYED_CONTENTION':
        return "Contention's";
      default:
        return '';
    }
  }
  
  

  async getRegiment(): Promise<void> {
    try {
      this.regimentData = await firstValueFrom(
        this.regimentService.getRegiment(this.regimentID)
      );
      this.regimentSelected = true;
    } catch {
      this.regimentSelected = false;
    }
  }

  async getSteamIds(): Promise<void> {
    try {
      this.steamIds = await firstValueFrom(
        this.regimentService.getGameIds(this.currentUser.id, this.regimentID)
      );
      this.updatePaginatedSteamIds(); // Initialize the steamIds array with the data for the first page
    } catch {
      this.regimentSelected = false;
    }
  }

  filterSteamIds(): void {
    if (!this.searchText) {
      this.steamIds = this.allSteamIds.slice(); // Restore original data
      this.currentPage = 1; // Reset to the first page after filtering
      this.updatePaginatedSteamIds(); // Update paginated results after filtering
      return;
    }
  
    const searchTextLowerCase = this.searchText.toLowerCase();
  
    // Filter the allSteamIds array based on the search text
    this.steamIds = this.allSteamIds.filter((user: any) => {
      const nickname = user.nickname ? user.nickname.toLowerCase() : "";
      const steamId = user.steamId ? user.steamId.toLowerCase() : "";
      const personaname = user.liveSteamData
        ? user.liveSteamData.personaname.toLowerCase()
        : "";
  
      return (
        nickname.includes(searchTextLowerCase) ||
        steamId.includes(searchTextLowerCase) ||
        personaname.includes(searchTextLowerCase)
      );
    });
  
    this.currentPage = 1; 
    this.updatePaginatedSteamIds(); 
  }
  
  
  

  updatePaginatedSteamIds(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedSteamIds = this.steamIds.slice(start, end);
  }
  


  async setGameId(): Promise<void> {
    const gameIdFormControl = this.steamIdForm.get('gameIdForm');
    if (gameIdFormControl && gameIdFormControl.valid) {
      const steamId = gameIdFormControl.value;
      console.log(steamId);
      this.gameIdForm = steamId;
    }
    
    try {
      const userId = this.currentUser.id;
      const regimentId = this.currentUser.regimentId;

      const response: any = await firstValueFrom(
        this.regimentService.setGameId(userId, regimentId, this.gameIdForm)
      );

      if (response && response.message) {
        this.openSnackBar(response.message, 2000);
      } else {
        this.openSnackBar("Steam ID set successfully!", 2000);
      }

      this.getSteamIds();
      this.toggleAddingSteam();
    } catch (error: any) {
      console.error("An error occurred while setting the game ID:", error);
      this.openSnackBar("An error occurred while setting the game ID.", 2000);
    }
  }

  getLevelData(xp: number): any {
    if (xp < 0 || !xp) {
      return "User has no experience.";
    }

    let n = 0;
    let s = 10000;
    let lvl = 0;
    let xpForCurrentLevel = 0;

    for (let i = 0; i < 100; ++i) {
      if (xp < n) {
        lvl = i;
        break;
      }

      xpForCurrentLevel = n;
      n += s;

      if (i !== 0 && i % 10 === 0) {
        s += 20000;
      }
    }

    if (lvl === 0) {
      lvl = 100;
      n -= s;
    } else {
      lvl = lvl - 1; 
    }

    const xpRq = n - xpForCurrentLevel; 
    const xpTowardsNextLevel = xp - xpForCurrentLevel; 
    const progress = (xpTowardsNextLevel / xpRq) * 100;

    const resObj = {
      lvl: lvl,
      xpRq: xpRq,
      xp: xpTowardsNextLevel,
      progress: progress,
    };

    return resObj;
  }

  getSteamIdPreview() {
    const gameIdFormControl = this.steamIdForm.get('gameIdForm');
    if (gameIdFormControl && gameIdFormControl.valid) {
      const steamId = gameIdFormControl.value;
      this.steamApiService.getSteamId(steamId).subscribe(
        (data) => {
          console.log('API response:', data); // Log the entire data object to inspect its structure
  
          if (data && data.response && data.response.players && data.response.players.length > 0) {
            this.previewData = data.response.players[0]; // Assign the first player's data to the previewData property
            console.log('Preview data:', this.previewData); // Log the extracted previewData
          } else {
            console.log('No data found in the response.');
          }
        },
        (err) => {
          console.error('Error occurred while fetching data:', err);
        }
      );
    }
  }
  
  

  getExperienceValue(stats: any[]): number {
    if (!stats) {
      return 1;
    }

    const stat = stats.find(
      (stat) => stat.name === "STAT_PROGRESSION_EXPERIENCE"
    );
    return stat ? stat.value : 1;
  }

  roundNumber(value: number): number {
    return Math.round(value);
  }

  toggleAddingSteam(): void {
    this.addingSteam = !this.addingSteam;
    this.addString = this.addingSteam ? "<i class='fa-solid fa-xmark mr-1'></i> Cancel" : "<i class='fa-solid fa-plus mr-1'></i> Add Steam ID";
  }

  openSnackBar(message: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.horizontalPosition = "center";
    config.verticalPosition = "top";

    this._snackBar.open(message, "Okay", config);
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
  }

  openProfileUrl() {
    const url = this.previewData?.profileurl;
    if (url) {
      window.open(url, '_blank');
    }
  }
  
  convertTo12HourTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); 
    return date.toLocaleTimeString('en-US', { hour12: true });
  }

  getPaginatedSteamIds() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.steamIds.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePaginatedSteamIds(); 
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedSteamIds(); 
    }
  }
  
  
  getTotalPages() {
    return Math.ceil(this.steamIds.length / this.itemsPerPage);
  }
  

  goToPage(page: number) {
    if (page < 1) {
      page = 1;
    } else if (page > this.getTotalPages()) {
      page = this.getTotalPages();
    }
  
    this.currentPage = page;
    this.updatePaginatedSteamIds();
  }
  
  
  shouldShowFirstEllipsis() {
    return this.currentPage > 3 && this.getTotalPages() > 3;
  }
  
  shouldShowLastEllipsis() {
    return this.getTotalPages() - this.currentPage > 2;
  }
  
  
  getVisiblePages() {
    const pages = [];
  
    pages.push(this.currentPage);
  
    if (this.getTotalPages() > 1) {
      if (this.currentPage < this.getTotalPages()) {
        pages.push(this.currentPage + 1);
      } else if (this.currentPage > 1) {
        pages.unshift(this.currentPage - 1);
      }
    }
  
    return pages;
  }
  
  
  isFormValid(): boolean {
    return this.steamIdForm.get("gameIdForm")?.valid || false;
  }

}

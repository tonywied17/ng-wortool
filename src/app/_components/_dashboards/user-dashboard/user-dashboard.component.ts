/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\board-user\board-user.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed February 21st 2024 2:37:58 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { TokenStorageService } from "src/app/_services/token-storage.service";
import { AuthService } from "src/app/_services/auth.service";
import { AuthInjectionServiceService } from "src/app/_services/auth-injection-service.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from "../../confirm-cancel-snackbar/confirm-cancel-snackbar.component";
import { FavoriteService } from "src/app/_services/favorite.service";
import { MapService } from "src/app/_services/map.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { DiscordService } from "src/app/_services/discord.service";
import { RegimentService } from "src/app/_services/regiment.service";
import { SharedDataService } from "src/app/_services/shared-data.service";

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  @ViewChild("selectBox") selectBox: any;

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectBox.nativeElement.selectedIndex = 0;
    }, 500);
  }

  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;
  guild_avatar_url = "";
  showPage1 = false;
  showPage2 = false;
  showPage3 = false;

  loading = true;

  passwordCurrent: string = "";
  passwordNew: string = "";
  passwordNewConfirm: string = "";

  email: string = "";
  avatar_url: any;
  discordId: string = "";
  regimentId: string = "";
  discordSyncUrl: string = "";
  useAvatarUrl = false;
  discordIsSynced = false;
  regimentSelected = false;
  discordData: any;
  regimentData: any;
  allRegimentsList: any;
  stillSelecting = false;

  currentFavorites: any;
  hasFavorites = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSize: number = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sharedService: AuthInjectionServiceService,
    private snackBar: MatSnackBar,
    private favoriteService: FavoriteService,
    private mapService: MapService,
    private router: Router,
    private httpClient: HttpClient,
    private location: Location,
    private discordService: DiscordService,
    private regimentService: RegimentService,
    public sharedDataService: SharedDataService
  ) {}

  /**
   * onPageSizeChange
   * This function is used to change the page size of the table
   * @param event - any - the event
   */
  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
    localStorage.setItem("pageSize", event.pageSize);
  }

  /**
   * On init
   */
  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params: Params) => {
      const page = params["page"];
      this.loadContent(page);
    });

    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      this.getFavorites();
      this.loading = false;
      // Processed
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });

    const storedPageSize = localStorage.getItem("pageSize");
    this.pageSize = storedPageSize ? +storedPageSize : 5;
  }

  /**
   * Get favorites
   * This function is used to get all the favorites for the current user
   * @returns - void
   */
  private getFavorites(): void {
    const userID = this.sharedDataService.currentUser.id;

    this.favoriteService.getByUserId(userID).subscribe(
      (response) => {
        this.currentFavorites = response;
        if (this.currentFavorites && this.currentFavorites.length > 0) {
          this.hasFavorites = true;

          this.mapService.getAll().subscribe({
            next: (maps) => {
              for (const favorite of this.currentFavorites) {
                const matchingMap = maps.find(
                  (map) => map.id === favorite.mapId
                );
                if (matchingMap) {
                  favorite.mapData = matchingMap;
                }
              }
              this.dataSource.data = this.currentFavorites;
              this.dataSource.paginator = this.paginator;
              this.paginator.pageSize = this.pageSize;
            },
            error: (error) => console.error("Error:", error),
          });
        } else {
          this.hasFavorites = false;
        }
      },
      (error) => {
        console.error("Error:", error);
      }
    );
  }

  /**
   * Go back
   * This function is used to go back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Load content
   * This function is used to load the content for the selected page
   * @param page - string - the page number
   */
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


  /**
   * Show snackbar
   * This function is used to show a snackbar
   * @param message - string - the message
   */
  private showSnackBar(message: string) {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      verticalPosition: "top",
    });
  }

  /**
   * Delete favorite
   * This function is used to delete a favorite
   * @param mapId - string - the map id
   */
  deleteFavorite(mapId: string) {
    let userId = this.sharedDataService.currentUser.id;

    this.favoriteService.delete(mapId, userId).subscribe((response) => {
      this.getFavorites();
      this.showSnackBar("Favorite Deleted");
    });
  }

  /**
   * Confirm delete
   * This function is used to confirm the deletion of a favorite
   * @param mapId - string - the map id
   * @param mapName - string - the map name
   */
  confirmDelete(mapId: string, mapName: string): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmCancelSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to delete '${mapName}' as a favorite?`,
          mapId,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.deleteFavorite(mapId);
    });
  }


 
}

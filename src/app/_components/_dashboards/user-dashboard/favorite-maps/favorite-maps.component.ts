import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FavoriteService } from "src/app/_services/favorite.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MapService } from "src/app/_services/map.service";
import { ConfirmCancelSnackbarComponent } from "src/app/_components/confirm-cancel-snackbar/confirm-cancel-snackbar.component";

@Component({
  selector: 'app-favorite-maps',
  templateUrl: './favorite-maps.component.html',
  styleUrl: './favorite-maps.component.scss'
})
export class FavoriteMapsComponent implements OnInit {
  currentFavorites: any;
  hasFavorites = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSize: number = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private snackBar: MatSnackBar,
    public sharedDataService: SharedDataService,
    private favoriteService: FavoriteService,
    private mapService: MapService,
  ) { }

  public isLoaded = false;
  
  async ngOnInit(): Promise<void> {
    try {
      await this.sharedDataService.retrieveInitialData();
      await Promise.all([this.getFavorites()]);
      const storedPageSize = localStorage.getItem("pageSize");
      this.pageSize = storedPageSize ? +storedPageSize : 5;
      this.isLoaded = true;
    } catch (error) {
      console.error("Error during initialization:", error);
    }
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
   * onPageSizeChange
   * This function is used to change the page size of the table
   * @param event - any - the event
   */
  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
    localStorage.setItem("pageSize", event.pageSize);
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

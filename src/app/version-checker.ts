import { Injectable } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { interval } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class VersionChecker {
  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
    this.checkForUpdates();
  }

  private checkForUpdates() {
    interval(6 * 60 * 60 * 1000).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });
  }

  public listenForUpdates() {
    this.swUpdate.available.subscribe(() => {
      const snackBarRef = this.snackBar.open(
        `A new version is available. Would you like to update?`,
        "Yes", {
          verticalPosition: "top",
        }
      );

      snackBarRef.onAction().subscribe(() => {
        window.location.reload();
      });
    });
  }
}
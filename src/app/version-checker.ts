import { Injectable } from "@angular/core";
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { interval, filter } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class VersionChecker {
  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
    this.checkForUpdates();
    this.listenForUpdates();
  }

  /**
   * Check for updates every 6 hours
   */
  private checkForUpdates(): void {
    interval(6 * 60 * 60 * 1000).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });
  }

  /**
   * Listen for updates
   */
  public listenForUpdates(): void {
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
    ).subscribe(() => {
      const snackBarRef = this.snackBar.open(
        'A new version is available. Would you like to update?',
        'Yes', {
          verticalPosition: 'top',
        }
      );

      snackBarRef.onAction().subscribe(() => {
        window.location.reload();
      });
    });
  }
}

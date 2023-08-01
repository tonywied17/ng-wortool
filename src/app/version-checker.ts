/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\version-checker.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue August 1st 2023 12:20:20 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Injectable } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { interval } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class VersionChecker {
  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
    this.checkForUpdates();
  }

  /**
   * Check for updates every 6 hours
   */
  private checkForUpdates() {
    interval(6 * 60 * 60 * 1000).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });
  }

  /**
   * Listen for updates
   */
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
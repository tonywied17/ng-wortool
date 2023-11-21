/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\confirm-delete-snackbar\confirm-delete-snackbar.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:54:19 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, Inject } from "@angular/core";
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from "@angular/material/snack-bar";

@Component({
  selector: 'app-confirm-cancel-snackbar',
  templateUrl: './confirm-cancel-snackbar.component.html',
  styleUrls: ['./confirm-cancel-snackbar.component.scss'],
})
export class ConfirmCancelSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmCancelSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  /**
   * On cancel click
   * This function is used to dismiss the snackbar
   */
  onCancelClick(): void {
    this.snackBarRef.dismiss();
  }

  /**
   * On confirm click
   * This function is used to dismiss the snackbar with action
   */
  onConfirmClick(): void {
    this.snackBarRef.dismissWithAction();
  }
}

import { Component, Inject } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

@Component({
  selector: 'app-confirm-delete-snackbar',
  templateUrl: './confirm-delete-snackbar.component.html',
  styleUrls: ['./confirm-delete-snackbar.component.scss']
})
export class ConfirmDeleteSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmDeleteSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  onCancelClick(): void {
    this.snackBarRef.dismiss();
  }

  onConfirmClick(): void {
    this.snackBarRef.dismissWithAction();
  }
}

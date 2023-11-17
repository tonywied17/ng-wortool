/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\reset-password\reset-password.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Thursday November 16th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu November 16th 2023 7:08:51 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 MolexWorks / Tone Web Design
 */


import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetToken: string | null;
  newPassword!: string;
  confirmPassword!: string;
  resetComplete = false;
  isForgotScenario = false;
  email!: string;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.resetToken = this.route.snapshot.paramMap.get('token');

    if (this.resetToken) {
      this.isForgotScenario = false;
    } else {
      this.isForgotScenario = true;
    }
  }

  forgotPassword() {
    this.authService.forgot(this.email).subscribe(
      () => {
        this.snackBar.open('Password reset email sent. Check your email and Spam Folder for instructions.', 'OK', {
          duration: 5000, 
        });
      },
      (error) => {
        this.snackBar.open('Error sending password reset email. Please try again.', 'OK', {
          duration: 5000,
        });
      }
    );
  }

  resetPassword() {
    if (!this.resetToken) {
      alert('Reset token is null.');
      return;
    }
  
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    this.authService.reset(this.resetToken, this.newPassword).subscribe(
      () => {
        this.resetComplete = true;
        this.snackBar.open('Password reset successful. You can now log in with your new password.', 'OK', {
          duration: 5000,
        });
      },
      (error) => {
        this.snackBar.open('Error resetting password. Please try again.', 'OK', {
          duration: 5000,
        });
      }
    );
  }
  
}

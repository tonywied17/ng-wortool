import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from '../_services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.scss']
})
export class BoardUserComponent implements OnInit {
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;

  showPage1 = false;
  showPage2 = false;
  showPage3 = false;

  private roles: string[] = [];


  message = '';
  id1: any;

  passwordForm: FormGroup;

  constructor(
    private token: TokenStorageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.passwordForm = this.formBuilder.group({
      passwordCurrent: ['', Validators.required],
      passwordNew: ['', [Validators.required, Validators.minLength(6)]],
      passwordNewConfirm: ['', Validators.required]
    });
    
  }


  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      const page = params['page'];
      this.loadContent(page);
    });

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      console.log(user)
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      this.showMod = this.roles.includes('ROLE_MODERATOR');
      this.showUser = true
    }

  }

  private loadContent(page: string): void {
    // Reset all flags
    this.showPage1 = false;
    this.showPage2 = false;
    this.showPage3 = false;

    // Set the flag based on the 'page' parameter
    if (page === '1') {
      this.showPage1 = true;
    } else if (page === '2') {
      this.showPage2 = true;
    } else if (page === '3') {
      this.showPage3 = true;
    }
  }


  updatePassword() {
    if (this.passwordForm.invalid) {
      return;
    }
  
    const passwordCurrent = this.passwordForm.get('passwordCurrent')!.value;
    const passwordNew = this.passwordForm.get('passwordNew')!.value;
  
    if (passwordNew !== this.passwordForm.get('passwordNewConfirm')!.value) {
      this.snackBar.open('New passwords do not match!', 'Close', {
        duration: 3000
      });
      return;
    }
  
    const userId = this.currentUser.id;
  
    this.authService.password(userId, passwordCurrent, passwordNew)
      .pipe(
        tap({
          next: () => {
            this.passwordForm.reset(); // Reset the form
            this.passwordForm.markAsPristine(); // Mark the form as pristine
            this.passwordForm.markAsUntouched(); // Mark the form as untouched
  
            // Clear the validation errors
            Object.keys(this.passwordForm.controls).forEach(key => {
              this.passwordForm.get(key)!.setErrors(null);
            });
  
            this.snackBar.open('Password updated successfully!', 'Close', {
              duration: 3000
            });

            this.logout();
          },
          error: error => {
            this.snackBar.open(error.message, 'Close', {
              duration: 3000
            });
          }
        })
      )
      .subscribe();
  }


  logout(): void {
    this.token.signOut();
    this.router.navigate(['/home']);
    setTimeout(() => {
      window.location.reload();
    }, 10);

  }
  

}

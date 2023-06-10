import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user.model';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from "../_services/auth.service";

@Component({
  selector: 'app-muster',
  templateUrl: './muster.component.html',
  styleUrls: ['./muster.component.scss']
})
export class MusterComponent implements OnInit {
  displayedColumns: string[] = ['nickname', 'regiment', 'events', 'drills', 'lastmuster', 'joindate', 'actions'];
  users: User[] = [];
  editingUser: User = {};
  selectedUser: User = new User;
  content?: string;
  currentUser: any;
  isLoggedIn = false;
  showAdmin = false;
  showUser = false;
  showMod = false;
  loading = true;

  constructor(
    private userService: UserService, 
    private token: TokenStorageService
    ,private authService: AuthService
    ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();
    const userID = this.currentUser.id;

    if (this.isLoggedIn) {
      this.authService.checkModeratorRole(userID).subscribe(
        (response) => {
          
          this.showMod = response.access;
          this.loading = false;
          this.getUsers();
        },
        (error) => {
          if (error.status === 403) {
            this.showMod = false;
          } else {
            console.error('Error:', error);
          }
          this.loading = false;
        }
      );
    }else{
      this.loading = false;
    }
  }

  getUsers(): void {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  editUser(user: User): void {
    this.editingUser = user;
  }

  updateEvents(event: any, user: User): void {
  
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if (!isNaN(value)) {
      user.events = value;

      this.userService.updateUser(user).subscribe();
    }

  }

  updateDrills(event: any, user: User): void {
  
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if (!isNaN(value)) {
      user.drills = value;
      this.userService.updateUser(user).subscribe();
    }

  }
  
  saveUser(): void {
    if (this.editingUser) {
      this.userService.updateUser(this.editingUser).subscribe(() => {
        this.getUsers();
      });
    }
  }

  cancelEdit(): void {
    this.editingUser = this.selectedUser;
  }

}

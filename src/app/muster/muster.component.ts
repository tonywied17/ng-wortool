import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user.model';
import { TokenStorageService } from '../_services/token-storage.service';

// https://api.tonewebdesign.com/pa/muster
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
  private roles: string[] = [];

  constructor(private userService: UserService, private token: TokenStorageService) { }

  ngOnInit(): void {

    this.isLoggedIn = !!this.token.getToken();
    this.currentUser = this.token.getUser();

    if (this.isLoggedIn) {
      const user = this.token.getUser();
      this.roles = user.roles;
      console.log(user)
      this.showAdmin = this.roles.includes('ROLE_ADMIN');
      console.log(this.showAdmin)
      this.showMod = this.roles.includes('ROLE_MODERATOR');
      console.log(this.showMod)
      this.showUser = true
    }

    this.getUsers();
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
      // Call your update method here
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

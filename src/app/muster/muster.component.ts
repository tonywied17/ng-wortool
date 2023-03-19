import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../_models/user.model';


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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
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
      // Call your update method here
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

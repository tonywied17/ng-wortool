import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DiscordService } from "src/app/_services/discord.service";
import { SharedDataService } from "src/app/_services/shared-data.service";

interface Role {
  id: string;
  name: string;
  color: number;
}
@Component({
  selector: 'app-enlister',
  templateUrl: './enlister.component.html',
  styleUrls: ['./enlister.component.scss']
})
export class EnlisterComponent implements OnInit {
  isDataLoaded: boolean = false;
  roles: Role[] = [];
  filteredRoles: any[] = [];
  roleFilter: string = '';
  isDropdownOpen: boolean = false;
  selectedRole: Role | null = null;
  users: any[] = [];
  showNicknameOnly: boolean = false;
  selectedUserIds: string[] = [];
  selectAll: boolean = true;
  checkLabel: string = "Uncheck All"

  constructor(
    private snackBar: MatSnackBar,
    private discordService: DiscordService,
    public sharedDataService: SharedDataService
  ) {}

  


  async ngOnInit(): Promise<void> {
    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      await this.retrieveComponentData();
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });
    
    console.log(this.roles);
    
  }

  async retrieveComponentData(): Promise<void> {
    await Promise.all([this.getRoles(this.sharedDataService.guildId)]);
    this.isDataLoaded = true;
  }



  async getRoles(regimentId: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.discordService.getGuildRoles(regimentId).subscribe(
        (data: any) => {
          this.roles = data;
          this.filteredRoles = [...this.roles];
          resolve();
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  async getUsersFromRole(guildId: any, roleName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.discordService.getUsersByRoles(guildId, roleName).subscribe(
        (data: any) => {
          this.users = data;
          console.log(data)
          this.selectedUserIds = this.users.map(user => user.id);
          resolve();
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  updateFilteredRoles(): void {
    this.filteredRoles = this.roles.filter(role =>
      role.name.toLowerCase().includes(this.roleFilter.toLowerCase())
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log(this.isDropdownOpen)
  }
  
  
  async selectRole(role: Role): Promise<void> {
    this.selectedRole = role;
    this.isDropdownOpen = false;
    this.getUsersFromRole(this.sharedDataService.guildId, this.selectedRole.name)
  }

  filterUsers(): any[] {
    if (this.showNicknameOnly) {
      return this.users.filter((user: { nickname: null | undefined; }) => user.nickname !== null && user.nickname !== undefined);
    } else {
      return this.users;
    }
  }

  enlistUsers(): void {
    const enlistedUsers = this.users
      .filter((user) => this.selectedUserIds.includes(user.id))
      .map((user) => ({ id: user.id, nickname: user.nickname || user.username }));

      const count = enlistedUsers.length;

      if (count > 0) {
        this.snackBar.open(`Enlisted ${count} user${count > 1 ? 's' : ''}`, 'Dismiss', {
          duration: 3000, 
          verticalPosition: 'top',
        });
      }
    console.log('Enlisted Users:', enlistedUsers);
    
  }

  updateSelectedUserIds(userId: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedUserIds.push(userId);
    } else {
      const index = this.selectedUserIds.indexOf(userId);
      if (index !== -1) {
        this.selectedUserIds.splice(index, 1);
      }
    }
    this.selectedUserIds = [...this.selectedUserIds];
  }
  
  toggleCheckAll(): void {
    if (this.selectAll) {
      this.selectedUserIds = [];
    } else {
      this.selectedUserIds = this.users.map((user) => user.id);
    }

    this.selectAll = !this.selectAll;
  }

}

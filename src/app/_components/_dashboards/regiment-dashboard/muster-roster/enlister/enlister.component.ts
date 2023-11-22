import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DiscordService } from "src/app/_services/discord.service";
import { SharedDataService } from "src/app/_services/shared-data.service";
import { MusterUserService } from "src/app/_services/muster-user.service";

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
  musterUsers: any[] = [];
  showNicknameOnly: boolean = false;
  selectedUserIds: string[] = [];
  selectAll: boolean = true;
  checkLabel: string = "Uncheck All"

  constructor(
    private snackBar: MatSnackBar,
    private discordService: DiscordService,
    public sharedDataService: SharedDataService,
    private musterUserService: MusterUserService
  ) {}

  async ngOnInit(): Promise<void> {
    this.sharedDataService.retrieveInitialData()
      .then(async () => {
        await this.retrieveComponentData();
      })
      .catch(error => {
        console.error("Error initializing shared data:", error);
      });
  }

  async retrieveComponentData(): Promise<void> {
    await Promise.all([
      this.getRoles(this.sharedDataService.guildId),
      this.getAllMusterUsers() 
    ]);
    this.isDataLoaded = true;
  }

  async getRoles(regimentId: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.discordService.getGuildRoles(regimentId).subscribe(
        (data: any) => {
          this.roles = data;
          this.filteredRoles = [...this.roles];
          this.filteredRoles.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB);
          });
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
          console.log('muster users: ' + this.musterUsers);
  
          this.users = this.users.filter(user => !this.musterUsers.some(musterUser => musterUser.discordId === user.id));
  
          this.selectedUserIds = this.users.map(user => user.id);
          resolve();
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  getAllMusterUsers() {
    this.musterUserService.getAll(this.sharedDataService.regimentId).subscribe(data => {
      console.log(data);
      this.musterUsers = data;

      this.users = this.users.filter(user => !this.musterUsers.some(musterUser => musterUser.discordId === user.id));
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
    const currentDate = new Date().toISOString().split('T')[0];
    const enlistedUsers = this.users
      .filter((user) => this.selectedUserIds.includes(user.id))
      .map((user) => ({
        discordId: user.id,
        nickname: user.nickname || user.username,
        regimentId: this.sharedDataService.regimentId,
        events: 0,
        drills: 0,
        join_date: currentDate,
        last_muster: currentDate,
      }));
  
    if (enlistedUsers.length > 0) {
      this.musterUserService.create(enlistedUsers).subscribe(
        (response) => {
          console.log('Enlisted Users:', response.data);
  
          this.users = this.users.filter((user) => !this.selectedUserIds.includes(user.id));
  
          this.snackBar.open(`Enlisted ${enlistedUsers.length} user${enlistedUsers.length > 1 ? 's' : ''}`, 'Dismiss', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        (error) => {
          console.error('Error enlisting users:', error);
          this.snackBar.open('Error enlisting users. Please try again.', 'Dismiss', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      );
    }
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

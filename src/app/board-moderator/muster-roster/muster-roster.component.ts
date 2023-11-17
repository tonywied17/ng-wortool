import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TokenStorageService } from "../../_services/token-storage.service";
import { AuthService } from "../../_services/auth.service";
import { RegimentService } from "../../_services/regiment.service";
import { DiscordService } from "src/app/_services/discord.service";
import { firstValueFrom } from "rxjs";

interface Role {
  id: string;
  name: string;
  color: number;
}

@Component({
  selector: 'app-muster-roster',
  templateUrl: './muster-roster.component.html',
  styleUrls: ['./muster-roster.component.scss']
})


export class MusterRosterComponent implements OnInit {
  isDataLoaded: boolean = false;
  roles: Role[] = [];
  filteredRoles: any[] = [];
  roleFilter: string = '';
  currentUser: any;
  isLoggedIn: boolean = false;
  regiment: any;
  regimentId: string | undefined;
  guildId: string | undefined;
  isDropdownOpen: boolean = false;
  selectedRole: Role | null = null;
  users: any[] = [];
  showNicknameOnly: boolean = false;
  selectedUserIds: string[] = [];
  selectAll: boolean = true;
  checkLabel: string = "Uncheck All"

  constructor(
    private snackBar: MatSnackBar,
    private regimentService: RegimentService,
    private discordService: DiscordService,
    private token: TokenStorageService,
    private authService: AuthService
  ) {}

  


  async ngOnInit(): Promise<void> {
    await this.retrieveInitialData();
    console.log(this.roles);
    
  }

  async retrieveInitialData(): Promise<void> {
    await Promise.all([this.getUser()]);
    this.isDataLoaded = true;
  }

  async getUser(): Promise<void> {
    this.isLoggedIn = !!this.token.getToken();
      this.currentUser = this.token.getUser();
      const userID = this.currentUser.id;
  
      if (this.isLoggedIn) {
        await this.authService
          .checkModeratorRole(userID, this.currentUser.regimentId)
          .toPromise()
          .then(async (response) => {
            if (this.currentUser.regimentId) {
              this.regimentId = this.currentUser.regimentId;
              await this.getRegiment(this.regimentId);
            }
          })
          .catch((error) => {
            console.error("Error:", error);        
          });
      }
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

  async getRegiment(id: any): Promise<void> {
    this.regiment = await firstValueFrom(this.regimentService.getRegiment(id));
    this.guildId = this.regiment.guild_id;
    await this.getRoles(this.guildId);
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
    this.getUsersFromRole(this.guildId, this.selectedRole.name)
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

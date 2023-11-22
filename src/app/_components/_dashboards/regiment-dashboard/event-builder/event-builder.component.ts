import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MapService } from 'src/app/_services/map.service'; 
import { DiscordService } from "src/app/_services/discord.service";
import { SharedDataService } from 'src/app/_services/shared-data.service';
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmCancelSnackbarComponent } from 'src/app/_components/confirm-cancel-snackbar/confirm-cancel-snackbar.component';

interface Role {
  id: string;
  name: string;
  color: number;
}

@Component({
  selector: 'app-event-builder',
  templateUrl: './event-builder.component.html',
  styleUrls: ['./event-builder.component.scss']
})
export class EventBuilderComponent implements OnInit {
  @ViewChild('roleFilterInput') roleFilterInput!: ElementRef;
  serverForm!: FormGroup;
  gameModes = ['Skirmish', 'Contention', 'Conquest', 'Picket Patrol', 'Pub Stomp'];
  skirmishAreas = ['Antietam', 'Harpers Ferry', 'South Mountain', 'Drill Camp'];
  sides = ['CSA', 'USA'];
  maps: any = []; 
  filteredMapNames1: any[] = [];
  filteredMapNames2: any[] = [];
  save: boolean = false;
  serverData: any;

  roles: Role[] = [];
  selectedRole: Role | null = null;
  filteredRoles: any[] = [];
  roleFilter: string = '';
  isDropdownOpen: boolean = false;

  editChannel: boolean = false;
  
  mapDetails:boolean = false;
  selectedGameModes: string[] = [];

  regimentChannels: any;
  targetChannel: any;
  webhook: any;
  

  constructor(
    private fb: FormBuilder,
    private discordService: DiscordService,
    private mapService: MapService,
    public sharedDataService: SharedDataService,
    private snackBar: MatSnackBar,
    private el: ElementRef, private renderer: Renderer2
  ) {}

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const isClickedInside = this.dropdownContainer.nativeElement.contains(event.target);
    if (!isClickedInside) {
      this.isDropdownOpen = false;
    }
  }

  async ngOnInit(): Promise<void> {
    
    this.serverForm = this.fb.group({
      serverName: [''],
      password: [''],
      extra: [''],
      rounds: this.fb.array([]),
    });
    
    this.addRound();
    this.addRound();
    this.getMaps();


    this.sharedDataService.retrieveInitialData()
    .then(async () => {
      await this.retrieveComponentData();
    })
    .catch(error => {
      console.error("Error initializing shared data:", error);
    });

    await this.getRegimentChannels(this.sharedDataService.regiment.guild_id);
    
  }

  async retrieveComponentData(): Promise<void> {
    await Promise.all([
      this.getRoles(this.sharedDataService.guildId),
    ]);
  }

  async getRoles(regimentId: any): Promise<void> {
    try {
      const data: any = await this.discordService.getGuildRoles(regimentId).toPromise();
      this.roles = data;
      this.filteredRoles = [...this.roles];

      this.filteredRoles.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error(error);
    }
  }


  updateFilteredRoles(): void {
    const filterValue = this.roleFilter.toLowerCase();
    
    if (filterValue.trim() !== '') {
      this.filteredRoles = this.roles.filter(role =>
        role.name.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredRoles = [...this.roles];
    }
  }
  
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;

    setTimeout(() => {
      const element = this.el.nativeElement.querySelector('#roleFilterInput');

      if (element) {
        this.renderer.selectRootElement(element).focus();
      }
    }, 100);
  }

  toggleChannelEdit() {
    this.editChannel = !this.editChannel;
  }

  selectRole(role: Role): void {
    const roleFilterControl = this.serverForm.get('roleFilter');
    if (roleFilterControl) {
      roleFilterControl.setValue(role.name);
    }
    this.selectedRole = role;
    console.log(role)
    this.toggleDropdown();
  }


  addRound() {
    const roundForm = this.fb.group({
      gameMode: [''],
      skirmishArea: [''],
      map: [''],
      side: [''],
      regiment: [''],
      info: [''],
      numberOfRounds: ['']
    });

    this.rounds.push(roundForm);
    this.selectedGameModes.push(''); 
  }

  removeRound(index: number) {
    this.rounds.removeAt(index);
  }

  saveServer() {
    this.serverData = this.serverForm.value;
    this.save = true
    console.log(this.serverData);
  }

  get rounds(): FormArray {
    return this.serverForm.get('rounds') as FormArray;
  }

  onSelectGameMode(index: number, selectedMode: string) {
    const roundForm = this.rounds.at(index) as FormGroup;
    roundForm.reset({
      gameMode: selectedMode,
      skirmishArea: '',
      map: '',
      side: '',
      regiment: '',
      info: '',
      numberOfRounds: '',
    });

    this.filterMapsBySkirmishArea(selectedMode);
    this.selectedGameModes[index] = selectedMode;
  }

  filterMapsBySkirmishArea(selectedMode: string): void {
    if (selectedMode === 'Skirmish' || selectedMode === 'Contention' || selectedMode === 'Conquest') {
      const skirmishArea = this.getSkirmishAreaForRound();
      this.onCampaignChange(skirmishArea);
    }
  }

  onCampaignChange(skirmishArea: string): void {
    const organizedData = this.organizeByCampaign(this.maps);
    if (skirmishArea === 'Antietam') {
      this.filteredMapNames1 = [
        ...(organizedData['Antietam'] || []),
        ...(organizedData['Antietam Conquest'] || []),
      ];
    } else if (skirmishArea === 'Harpers Ferry') {
      this.filteredMapNames1 = [
        ...(organizedData['Harpers Ferry'] || []),
        ...(organizedData['Harpers Ferry Conquest'] || []),
      ];
    } else if (skirmishArea === 'South Mountain') {
      this.filteredMapNames1 = [
        ...(organizedData['South Mountain'] || []),
        ...(organizedData['South Mountain Conquest'] || []),
      ];
    } else if (skirmishArea === 'Drill Camp' || skirmishArea === 'Drillcamp') {
      this.filteredMapNames1 = [
        ...(organizedData['Drill Camp'] || []),
        ...(organizedData['Drillcamp Conquest'] || []),
      ];
    } else {
      this.filteredMapNames1 = [];
    }
  }

  organizeByCampaign(mapNames: any): any {
    const organizedData: any = {};
    const sortedMapNames = Object.keys(mapNames).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const map of sortedMapNames) {
      const campaign = mapNames[map];
      if (!organizedData.hasOwnProperty(campaign)) {
        organizedData[campaign] = [];
      }
      organizedData[campaign].push(map);
    }

    return organizedData;
  }

  getMaps(): void {
    this.mapService.getAll().subscribe({
      next: (data) => {
        this.maps = data;
        console.log(this.maps); 
      },
      error: (e) => console.error(e)
    });
  }


  getSkirmishAreaForRound(): string {
    return '';
  }

  getFilteredMaps(skirmishArea: string): any[] {
    if (skirmishArea) {
      return this.maps.filter((map: any) => map.campaign === skirmishArea || map.campaign === `${skirmishArea} Conquest`);
    } else {
      return [];
    }
  }


  sendMessage(): void {
    this.saveServer();
    const embed: any = {
      username: "Server Info",
      avatar_url: this.sharedDataService.regiment.guild_avatar,
      embeds: [
        {
          title: "Server Information",
          description: this.taggedRoles(),
          thumbnail: {
            url: "https://molex.cloud/2023/June/27/_HmN/boticon.png",
          },
          fields: [],
          footer: {
            text: "WorTool.com",
            icon_url: "https://wortool.com/assets/icon.png",
          },
          color: 13092744,
        },
      ],
    };
  
    if (!this.serverData.serverName) {
      this.snackBar.open(
        "Please fill in the required fields: server name",
        "Close",
        {
          verticalPosition: "top",
          duration: 3000,
        }
      );
    } else {
      if (this.serverData.serverName) {
        embed.embeds[0].fields.push({ name: "Server Name", value: this.serverData.serverName });
      }
      if (this.serverData.password) {
        embed.embeds[0].fields.push({
          name: "Password",
          value: `\`${this.serverData.password}\``,
        });
      }
  
      this.serverData.rounds.forEach((round: any, index: number) => {
        const roundDetails = [];
      
        if (round.skirmishArea && round.gameMode) {
          roundDetails.push(`**${round.gameMode}** on **${round.skirmishArea}**`);
        }
        if (!round.skirmishArea && round.gameMode) {
          roundDetails.push(`**Game Mode:** ${round.gameMode}`);
        }
        if (round.skirmishArea && !round.gameMode) {
          roundDetails.push(`**Skirmish Area:** ${round.skirmishArea}`);
        }
        if (round.map) {
          roundDetails.push(`**Map:** [${round.map}](${this.getMapLink(round.map)})`);
        }
        if (round.side) {
          roundDetails.push(`**Side:** ${round.side}`);
        }
        if (round.regiment) {
          roundDetails.push(`**Regiment:** \`${round.regiment}\``);
        }
        if (round.info) {
          roundDetails.push(`**Units:** ${round.info}`);
        }
        if (round.numberOfRounds) {
          roundDetails.push(`Number of Rounds: ${round.numberOfRounds}`);
        }
      
        if (roundDetails.length > 0) {
          embed.embeds[0].fields.push({
            name: `__Round ${index + 1}__`,
            value: roundDetails.join("\n"),
          });
        }
      });
  
      this.sendWebhook(this.sharedDataService.regiment.webhook, embed);
      this.snackBar.open(
        "Server information posted to announcements",
        "Close",
        {
          verticalPosition: "top",
          duration: 3000,
        }
      );
    }
  }


  sendWebhook(url: string, params: any): void {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(params));
  }



  taggedRoles(): string {
    let roles = "";
    if (this.selectedRole) {
      roles += `<@&${this.selectedRole.id}>`;
    }

    return roles.trim();
  }

  getMapLink(map: string): string {
    const matchedMap = this.maps.find((item: any) => item.map === map);
    if (matchedMap) {
      return `https://wortool.com/maps/${matchedMap.id}`;
    }
    return "";
  }

thisMapDetails(): void {
  const selectedIndex = this.rounds.controls.findIndex((round) => round.get('gameMode')?.value === 'Skirmish' || round.get('gameMode')?.value === 'Contention' || round.get('gameMode')?.value === 'Conquest');

  if (selectedIndex !== -1) {
    const selectedRound = this.rounds.controls[selectedIndex] as FormGroup;
    const selectedMap = selectedRound.get('map')?.value;

    console.log('Selected Map:', selectedMap);

    const matchingMap = this.maps.find((map: any) => map.map === selectedMap);
    
    if (matchingMap) {
      console.log('Matching Map Details:', matchingMap);
    } else {
      console.log('No matching map found in this.maps.');
    }
  } else {
    console.log('No round with Skirmish, Contention, or Conquest game mode found.');
  }
}

isSelectedGameMode(selectedMode: string, currentMode: string): boolean {
  return selectedMode === currentMode;
}

async getRegiment(): Promise<void> {
  await this.getRegimentChannels(this.sharedDataService.regiment.guild_id);
}

async getRegimentChannels(guildId: string): Promise<void> {
  if (this.sharedDataService.regimentId) {
    await this.discordService
      .getGuildChannels(guildId)
      .toPromise()
      .then((response: any) => {
        this.regimentChannels = response.channels;
      });
  }
}


async updateTargetChannel(selectedValue: string): Promise<void> {
  this.targetChannel = selectedValue;
  const snackBarRef = this.snackBar.openFromComponent(
    ConfirmCancelSnackbarComponent,
    {
      data: {
        message: `Are you sure you want to change your event channel?`,
      },
      duration: 5000,
      verticalPosition: "top",
      panelClass: "confirm-delete-snackbar",
    }
  );

  snackBarRef.onAction().subscribe(async () => {
    await this.createWebhook(this.sharedDataService.regiment.guild_id, this.targetChannel);
  });
}


async createWebhook(guildId: string, channelId: string): Promise<void> {
  await this.discordService
    .createWebhook(guildId, channelId)
    .toPromise()
    .then((response: any) => {
      this.webhook = response;
      this.snackBar.open(
        `$Webhook created for channel ${this.targetChannel}!`,
        "Close",
        { duration: 3000 }
      );
      // this.getRegiment();
    });
}

}

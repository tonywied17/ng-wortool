import { Component, OnInit } from '@angular/core';
import { DiscordService } from '../_services/discord.service';

@Component({
  selector: 'app-discord',
  templateUrl: './discord.component.html',
  styleUrls: ['./discord.component.scss']
})
export class DiscordComponent implements OnInit {

  guildId = '850786736756883496'; // Initialize with the desired guild ID
  channelId = '901993697888051200'; // Initialize with the desired channel ID
  message = '';

  constructor(
    public discordService: DiscordService
  ) { }

  ngOnInit(): void {
  }

  sendMessage(): void {
    if (this.guildId && this.channelId && this.message) {
      const channelId = `${this.guildId}/${this.channelId}`;
      this.discordService.sendMessage(channelId, this.message);
      this.message = ''; // Clear the message input
    }
  }
}

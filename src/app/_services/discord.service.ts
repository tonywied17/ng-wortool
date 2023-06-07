import { Injectable } from '@angular/core';
import { ChannelType, Client, Message, TextBasedChannel } from 'discord.js';

@Injectable({
  providedIn: 'root'
})
export class DiscordService {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        'GuildMessages',    
        'Guilds',                // Allows receiving guild data
        'GuildBans',             // Allows receiving guild ban data
        'GuildEmojisAndStickers',// Allows receiving guild emoji and sticker data
        'GuildIntegrations',     // Allows receiving guild integration data
        'GuildWebhooks',         // Allows receiving guild webhook data
        'GuildInvites',          // Allows receiving guild invite data
        'GuildVoiceStates',      // Allows receiving guild voice state data
        'GuildPresences',        // Allows receiving guild presence data
        'GuildMessages',         // Allows receiving guild message data
        'GuildMessageReactions', // Allows receiving guild message reaction data
        'GuildMessageTyping',    // Allows receiving guild message typing data
        'DirectMessages',        // Allows receiving direct message data
        'DirectMessageReactions',// Allows receiving direct message reaction data
        'DirectMessageTyping',   // Allows receiving direct message typing data
      ]
    });
    
    

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', (message: Message) => {
      console.log(`Received message: ${message.content}`);
    });

    this.client.login('YOUR_BOT_TOKEN')
      .catch(error => console.error('Failed to login:', error));
  }

  sendMessage(channelId: string, message: string): void {
    const channel = this.client.channels.cache.get(channelId) as TextBasedChannel | undefined;
  
    if (channel && (channel.type === ChannelType.GuildText || channel.type === ChannelType.DM)) {
      channel.send(message);
    }
  }
  
  
}

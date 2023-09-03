import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { SupabaseService } from './supabase.service';
import { ImageService } from './image.service';

import { Client, CommandInteraction, Intents, MessageAttachment, MessageEmbed, Permissions } from 'discord.js';
import { firstValueFrom } from 'rxjs';

import { Channel, Message, NotifType } from 'src/interfaces/message.interface';

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DiscordService {

  private client: Client;

  constructor(
    private readonly http: HttpService,
    private readonly supaSvc: SupabaseService,
    private imgSvc: ImageService
  ) {
 
    if (Number(process.env.DISCORD_ENABLED)) {
      this.initializeBot();
      // this.registerSlashCommands();
    }
  }
  
  // Initialize the bot
  async initializeBot() {
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    this.client.on('ready', () => Logger.debug(`Logged in!`, this.client.user.tag));

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;
  
      if (interaction.commandName === 'setchannel') {
        await this.setDesignatedChannel(interaction);
      }

      if (interaction.commandName === 'test') {
        await this.testMessage(interaction);
      }
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN);

    Logger.debug('Discord bot initialized.');
  }

  // Set the designated channel for the bot to post in
  async setDesignatedChannel(interaction: CommandInteraction<any>) {  
    if (!interaction.member) return;

    const member = interaction.member;
    if (!('permissions' in member)) return;

    const memberPermissions = member.permissions instanceof Permissions ? member.permissions : new Permissions();
    if (!memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
      await interaction.reply({
        content: 'You do not have the required permissions to set the designated channel.',
        ephemeral: true,
      });
      return;
    }
  
    const channelId = interaction.channelId;
    const serverId = interaction.guildId;
    const type = 'all';
    // const type = interaction.options.getString('type', true) || 'all';

    await this.supaSvc.setChannelForServer(serverId, channelId, type);
  
    await interaction.reply({
      content: `This channel will now receive ${type} notifications`,
      ephemeral: true,
    });
  }

  async postMessage(data: Message, type?: NotifType, channels?: Channel[]): Promise<Channel[]> {
    
    channels = channels ?? await this.supaSvc.getAllChannels();
    if (!channels?.length) return;

    // Filter the channels by type
    if (type) {
      channels = channels.filter(channel => channel.type === type || channel.type === 'all');
      Logger.log(`Found ${channels.length} channels for type ${type}`);
    }

    // Create the attachment
    const imageBuffer = Buffer.from(data.image.base64, 'base64');
    const attachment = new MessageAttachment(imageBuffer, `${data.tokenId}.png`);

    // Create the embed
    const embed = new MessageEmbed()
      .setColor(`#${data.image.color}`)
      .setImage(`attachment://${data.tokenId}.png`)
      .addFields({
        name: data.title,
        value: `\`\`\`${data.discordText}\`\`\``,
        inline: true
      });

    embed.footer = { text: `phunks.auction` };

    // Loop through all channels and send the message
    for (const channel of channels) {
      Logger.debug(`Sending message to channel`, channel.channelId);
      try {
        const ch = await this.client.channels.fetch(channel.channelId);

        if (ch?.isText()) {
          await ch.send({ embeds: [embed], files: [attachment] });
        } else {
          console.error(`Channel with ID ${ch.id} not found or not a text channel.`);
        }
      } catch (error) {
        console.error(`Error sending message to channel with ID ${channel.channelId}:`, error);
      }
    }

    return channels;
  }

  async testMessage(interaction: CommandInteraction<any>) {
    if (!interaction.member) return;

    const member = interaction.member;

    if (!('permissions' in member)) return;

    const memberPermissions = member.permissions instanceof Permissions ? member.permissions : new Permissions();
    if (!memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
      await interaction.reply({
        content: 'You do not have the required permissions to set the designated channel.',
        ephemeral: true,
      });
      return;
    }
  
    // const type = interaction.options.getString('type', true) as NotifType;
    const type = 'all';
    const channels = await this.supaSvc.getChannelsFromServerId(interaction.guildId);

    const tokenId = Math.floor(Math.random() * 10000).toString();

    const image = await this.imgSvc.createImage(tokenId);
    const title = `📢 Phunk #${tokenId} has been put up for auction!`;
    const discordText = `Started by: ${interaction.user.username}.eth\nAuction Ends: ${new Date().toUTCString()}\n\nTime remaining:\n4 days\n2 hours\n0 minutes\n69 seconds`;

    const channelsPosted = await this.postMessage({
      title,
      discordText,
      pushText: discordText,
      image,
      tokenId
    }, type, channels);
  
    if (channelsPosted?.length) {
      await interaction.reply({
        content: `Test notification sent successfully! ${channelsPosted.length} channels notified.`,
        ephemeral: true,
      });
    }
  }

  // This only needs to be run once to register the slash commands
  async registerSlashCommands() {
    const commands = [
      {
        name: 'setchannel',
        description: 'Set the designated channel for the bot to post in',
      },
      {
        name: 'test',
        description: 'Test the bot',
      }
    ];
  
    try {
      console.log('Started refreshing application (/) commands.');
  
      const url = `https://discord.com/api/v9/applications/${process.env.DISCORD_CLIENT_ID}/commands`;
      const headers = { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` };
  
      await firstValueFrom(this.http.put(url, commands, { headers }));
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }
  
}
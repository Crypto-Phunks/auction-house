import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import { Channel } from 'src/interfaces/message.interface';

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});

@Injectable()
export class SupabaseService {
  
  async setChannelForServer(serverId: string, channelId: string, type: string): Promise<any> {
    // Query the 'channels' table to find the server with the given ID
    const { data: serverData, error: serverError } = await supabase
      .from('servers__auction_house')
      .select('channels')
      .eq('id', serverId);
  
    // If there's an error in the query, log it and return null
    if (serverError) {
      console.log(serverError);
      return null;
    }
  
    // If the server is found in the 'channels' table
    if (serverData?.length) {
      // Create a new channels array, replacing the channel with the matching channelId or appending it if not found
      const newChannels = serverData[0].channels.map(channel => channel.channelId === channelId ? { channelId, type } : channel);
      if (!newChannels.some(channel => channel.channelId === channelId)) {
        newChannels.push({ channelId, type });
      }
  
      // Update the existing record with the new channels array
      const { data, error } = await supabase
        .from('servers__auction_house')
        .update({ channels: newChannels })
        .eq('id', serverId);
  
      // If there's an error in the update, log it and return null
      if (error) {
        console.log(error);
        return null;
      }
  
      // Return the updated data
      return data;
    }
  
    // If the server is not found in the 'channels' table
    // Insert a new record with the server ID and channel information
    const { data, error } = await supabase
      .from('servers__auction_house')
      .upsert({
        id: serverId,
        updatedAt: new Date(),
        channels: [{
          channelId: channelId,
          type: type,
        }]
      });
  
    // If there's an error in the upsert, log it and return null
    if (error) {
      console.log(error);
      return null;
    }
  
    // Return the inserted data
    return data;
  }
  
  async getChannelsFromServerId(serverId: string): Promise<Channel[]> {

    const { data, error } = await supabase
      .from('servers__auction_house')
      .select('channels')
      .eq('id', serverId)
      .single()
    
    if (error) {
      console.log(error);
      return null;
    }
    
    return data?.channels;
  }
  
  async getAllChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('servers__auction_house')
      .select('channels')

    if (error) {
      console.log(error);
      return null;
    }

    return data.map(d => d.channels).flat() as Channel[];
  }

  async addSubscriptionToken(token: string, topic: string): Promise<any> {
    const { data, error } = await supabase
      .from('tokens__auction_house')
      .upsert({ token, topics: [topic] });

    if (error) return null;
    
    // Get the first 8 and last 8 characters of the token
    const tokenShort = `${token.slice(0, 12)}...${token.slice(-12)}`;
    Logger.log(`Added subscription token ${tokenShort}`);
    return data;
  }

  async getSubscriptionTokens(topic: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('tokens__auction_house')
      .select('token')
      // .contains('topics', [topic]);

    if (error) {
      console.log(error);
      return null;
    }

    return data.map(d => d.token);
  }
}
import { Injectable } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fwnojqynzeruxvvngkyc.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

@Injectable()
export class SupabaseService {
  
  async getChannelFromServerId(serverId: string): Promise<string> {
    const { data, error } = await supabase
      .from('channels')
      .select('channel_id')
      .eq('id', serverId)
      .single()
    
    if (error) {
      console.log(error);
      return null;
    }
    
    return data?.channel_id;
  }

  async setChannelForServer(serverId: string, channelId: string): Promise<any> {
    const { data, error } = await supabase
      .from('channels')
      .upsert({ id: serverId, channel_id: channelId, updated_at: new Date() })
    
    if (error) {
      console.log(error);
      return null;
    }
    
    return data;
  }

  async getAllChannels(): Promise<any[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
    
    if (error) {
      console.log(error);
      return null;
    }
    
    return data.map(d => d.channel_id);
  }

}
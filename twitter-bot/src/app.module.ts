import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AppService } from './app.service';
import { ImageService } from './services/image.service';
import { TweetService } from './services/tweet.service';
import { Web3Service } from './services/web3.service';
import { DiscordService } from './services/discord.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [
    AppService,
    TweetService,
    Web3Service,
    ImageService,
    DiscordService,
    SupabaseService
  ],
})
export class AppModule {}

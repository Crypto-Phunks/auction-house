import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { ImageService } from './services/image.service';
// import { TweetService } from './services/tweet.service';
import { Web3Service } from './services/web3.service';
import { DiscordService } from './services/discord.service';
import { SupabaseService } from './services/supabase.service';
import { PushService } from './services/push.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    AppService,
    // TweetService,
    Web3Service,
    ImageService,
    DiscordService,
    SupabaseService,
    PushService
  ],
})
export class AppModule {}

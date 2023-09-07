import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { ImageService } from './services/image.service';
// import { TweetService } from './services/tweet.service';
import { Web3Service } from './services/web3.service';
import { DiscordService } from './services/discord.service';
import { SupabaseService } from './services/supabase.service';
import { PushService } from './services/push.service';
import { MetaService } from './services/meta.service';

import { join } from 'path';

@Module({
  imports: [
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'cards'),
      renderPath: '/',
      serveStaticOptions: {
        cacheControl: true,
        dotfiles: 'ignore',
        etag: true,
        fallthrough: false,
        immutable: true,
        index: false,
        lastModified: true,
        maxAge: '1h',
        redirect: false,
        setHeaders: (res, path, stat) => {
          res.set('x-timestamp', Date.now().toString());
        }
      }
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // TweetService,
    Web3Service,
    ImageService,
    DiscordService,
    SupabaseService,
    PushService,
    MetaService
  ],
})
export class AppModule {}

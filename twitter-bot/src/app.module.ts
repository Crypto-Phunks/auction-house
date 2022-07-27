import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ImageService } from './services/image.service';
import { TweetService } from './services/tweet.service';
import { Web3Service } from './services/web3.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    TweetService,
    Web3Service,
    ImageService
  ],
})
export class AppModule {}

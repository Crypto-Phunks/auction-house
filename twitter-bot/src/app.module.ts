import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ImageService } from './image.service';
import { TweetService } from './tweet.service';
import { Web3Service } from './web3.service';

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

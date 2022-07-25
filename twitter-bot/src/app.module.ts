import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { TweetService } from './tweet.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    TweetService
  ],
})
export class AppModule {}

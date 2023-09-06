import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { json, urlencoded } from 'express';

import fetch, { Headers, Request } from 'node-fetch';

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
  globalThis.Headers = Headers as any;
  globalThis.Request = Request as any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors({
    origin: '*',
    // origin: [
    //   '*',
    //   'localhost',
    //   'http://localhost',
    //   'https://localhost',
    //   'http://localhost:4200',
    //   'http://localhost:4201',
    //   'https://flooredape.io',
    //   'https://flooredape.com',
    //   'https://app.flooredape.io',
    //   'https://app.flooredape.com',
    //   'https://staging.flooredape.io',
    //   'https://staging.flooredape.com',
    //   'https://beta.flooredape.com'
    // ],
    methods: ['GET', 'POST'],
  });
  await app.listen(3200);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { SupabaseService } from './services/supabase.service';

@Controller()
export class AppController {

  constructor(
    private readonly spbSvc: SupabaseService
  ) {}

  @Post('subscribe')
  async refreshMetadata(@Body() body: { token: string, topic: string }): Promise<any> {
    Logger.log(`Received subscription request from ${body.token}`);
    return this.spbSvc.addSubscriptionToken(body.token, body.topic || 'all');
  }

}
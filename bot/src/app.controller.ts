import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { SupabaseService } from './services/supabase.service';

@Controller()
export class AppController {

  constructor(
    private readonly spbSvc: SupabaseService
  ) {}

  @Post('subscribe')
  async refreshMetadata(@Body() body: any): Promise<any> {
    return this.spbSvc.addSubscriptions(body);
  }

}

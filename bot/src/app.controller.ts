import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';

import { SupabaseService } from './services/supabase.service';
import { MetaService } from './services/meta.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {

  constructor(
    private readonly spbSvc: SupabaseService,
    private readonly metaSvc: MetaService,
  ) {}

  @Post('subscribe')
  async refreshMetadata(@Body() body: any): Promise<any> {
    console.log('body', body);
    return this.spbSvc.addSubscriptions(body);
  }

  @Get(['card', 'card/*'])
  async getCard(@Req() request: Request, @Res() res: Response): Promise<any> {
    console.log('request.url', request.url);
    const pathArr = request.url.split('/').filter((x) => x && x !== 'card');
    const cardData = await this.metaSvc.getCard(pathArr[1]);
    res.send(cardData);
  }
}


// https://8b62-2604-3d09-976-c3f0-6d61-ef1e-a767-64ee.ngrok-free.app/card/auction/1060
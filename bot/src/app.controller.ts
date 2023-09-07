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
    return this.spbSvc.addSubscriptions(body);
  }

  @Get('card/*')
  async getCard(@Req() request: Request, @Res() res: Response): Promise<any> {

    console.log(request.url);

    const pathArr = request.url.split('/').filter((x) => x && x !== 'card');
    const cardImageUrl = await this.metaSvc.getCard(pathArr[1]);

    console.log(cardImageUrl);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="test123">
        <meta property="twitter:description" content="test">
        <meta property="twitter:image" content="${cardImageUrl}">
        <title></title>
      </head>
      <body>
        <!-- Your body content here -->
      </body>
      </html>
    `;

    res.send(html);
  }

}


// https://8b62-2604-3d09-976-c3f0-6d61-ef1e-a767-64ee.ngrok-free.app/card/auction/1060
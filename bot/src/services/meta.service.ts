import { Injectable } from '@nestjs/common';

import { Web3Service } from './web3.service';
import { ImageService } from './image.service';

import { mkdir, writeFile } from 'fs/promises';

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MetaService {

  constructor(
    private readonly web3Svc: Web3Service,
    private readonly imageSvc: ImageService,
  ) {
    mkdir('./cards').catch((err) => console.log(err));
  }

  async getCard(auctionId?: string): Promise<any> {
    const image = await this.imageSvc.createImage(auctionId);
    await writeFile(`./cards/${auctionId}.png`, image.base64, 'base64');

    return `https://goerli.phunks.auction/api/${auctionId}.png`;
  }
}
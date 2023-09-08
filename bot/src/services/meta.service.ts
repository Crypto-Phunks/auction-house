import { Injectable } from '@nestjs/common';

import { Web3Service } from './web3.service';
import { ImageService } from './image.service';
import { GraphQLService } from './gql.service';

import { mkdir, writeFile } from 'fs/promises';

import dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MetaService {

  constructor(
    private readonly web3Svc: Web3Service,
    private readonly imageSvc: ImageService,
    private readonly gqlSvc: GraphQLService
  ) {
    mkdir('./cards').catch((err) => console.log(err));

    // this.getCard('76').then((res) => {
    //   // console.log(res)
    // });
  }

  async getCard(auctionId?: string): Promise<any> {
    const auction = await this.gqlSvc.getAuction(auctionId);
    const image = await this.imageSvc.createCard(auction);

    await writeFile(`./cards/${auctionId}.png`, image.base64, 'base64');
    return `https://goerli.phunks.auction/api/${auctionId}.png`;
  }
}
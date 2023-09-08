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

    this.getCard().then((res) => {
      // console.log(res)
    });
  }

  async getCard(auctionId?: string): Promise<string> {

    if (!auctionId) {
      const current = await this.web3Svc.getCurrentAuction();
      auctionId = current.auctionId.toString();
    }

    const auction = await this.gqlSvc.getAuction(auctionId);
    const image = await this.imageSvc.createCard(auction);

    await writeFile(`./cards/${auctionId}.png`, image.base64, 'base64');

    const imageUrl = `${process.env.IMAGE_URL}/${auctionId}.png`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="CryptoPhunks Auction #${auction.id}">
        <meta property="twitter:description" content="CryptoPhunks Auction House was built with the purpose of facilitating perpetual auctions for CryptoPhunks held in the Treasury Vault.">
        <meta property="twitter:image" content="${imageUrl}">
        <title></title>
      </head>
      <body></body>
      </html>
    `;

    return html;
  }
}
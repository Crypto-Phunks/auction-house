import { Injectable } from '@nestjs/common';

import { BigNumber, ethers } from 'ethers';

import auctionABI from '../abi/AuctionHouseABI.json';
import punkDataABI from '../abi/PunkData.json';

const alchemyURL = 'https://eth-rinkeby.alchemyapi.io/v2';

@Injectable()
export class Web3Service {

  public provider = new ethers.providers.JsonRpcProvider(`${alchemyURL}/${process.env.ALCHEMY_API_KEY}`);
  public auctionHouseContract = new ethers.Contract(process.env.AUCTION_CONTRACT_ADDRESS, auctionABI, this.provider);
  public punkDataContract = new ethers.Contract(process.env.PUNK_DATA_ADDRESS, punkDataABI, this.provider);

  weiToEth(wei: BigNumber): string {
    return ethers.utils.formatUnits(wei, 'ether');
  }

}
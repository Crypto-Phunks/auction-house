import { Injectable } from '@nestjs/common';

import { BigNumber, ethers } from 'ethers';

import auctionABI from '../abi/AuctionHouseABI.json';
import punkDataABI from '../abi/PunkData.json';

import dotenv from 'dotenv';
dotenv.config();

const auctionContractAddress = process.env.NODE_ENV === 'prod' ? process.env.AUCTION_CONTRACT_ADDRESS : process.env.DEV_AUCTION_CONTRACT_ADDRESS;
const punkDataAddress = process.env.NODE_ENV === 'prod' ? process.env.PUNK_DATA_ADDRESS : process.env.DEV_PUNK_DATA_ADDRESS;

@Injectable()
export class Web3Service {

  // public provider = new ethers.providers.JsonRpcProvider(`http://geth.dappnode:8545`);
  public provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  public auctionHouseContract = new ethers.Contract(auctionContractAddress, auctionABI, this.provider);
  public punkDataContract = new ethers.Contract(punkDataAddress, punkDataABI, this.provider);

  weiToEth(wei: BigNumber): string {
    return ethers.utils.formatUnits(wei, 'ether');
  }

}
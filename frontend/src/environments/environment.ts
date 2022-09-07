// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import auctionHouseABI from '../app/abi/AuctionHouse.json';
import punkDataABI from '../app/abi/PunkData.json';
import phunkTokenABI from '../app/abi/PhunkToken.json';

export const environment = {
  production: false,
  httpRpc: 'https://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  wssRpc: 'wss://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  graphURI: 'https://api.studio.thegraph.com/query/4302/crypto-phunks-auction-house/v0.0.3-2',
  abis: {
    auctionHouseABI,
    punkDataABI,
    phunkTokenABI
  },
  addresses: {
    // Auction house contract
    auctionHouseAddress: '0x0E7f7d8007C0FCcAc2a813a25f205b9030697856',
    // Punk Data Contract
    punkDataAddress: '0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2',
    // Treasurey Address (Where the phunks live)
    treasuryWalletAddress: '0x61f874551c69f0E40c9f55219107B408C989aDEc',
    // CryptoPhunks Token Contract
    phunkTokenAddress: '0xf07468ead8cf26c752c676e43c814fee9c8cf402'
  },
  network: 'mainnet',
  auctionStartBlock: 15225534
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

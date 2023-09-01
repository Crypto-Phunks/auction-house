import auctionHouseABI from '../app/abi/AuctionHouse.json';
import punkDataABI from '../app/abi/PunkData.json';
import phunkTokenABI from '../app/abi/PhunkToken.json';

// // This file can be replaced during build by using the `fileReplacements` array.
// // `ng build` replaces `environment.ts` with `environment.prod.ts`.
// // The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  httpRpc: 'http://goerli-geth.dappnode:8545',
  graphURI: 'https://api.studio.thegraph.com/query/4302/crypto-phunks-auction-goerli/version/latest',
  abis: {
    auctionHouseABI,
    punkDataABI,
    phunkTokenABI
  },
  addresses: {
    // Auction house contract
    auctionHouseAddress: '0x1CCf05242C20c82B0f8d7C2E80679dEc4f484325',
    // Punk Data Contract
    punkDataAddress: '0xd61Cb6E357bF34B9280d6cC6F7CCF1E66C2bcf89',
    // Treasurey Address (Where the phunks live)
    treasuryWalletAddress: '0xC8322E62c01ecD0428781C6fCd165199Aa941d7D',
    // CryptoPhunks Token Contract
    phunkTokenAddress: '0x5B452c76D51e5ab02805477F3Aaf1b612f045dD6'
  },
  chainId: 5,
  auctionStartBlock: 9610116,
  notifications: {
    vapidKey: 'BGMg426N6tLVS6OsWuCxfewDOomVAcPLhi2KkUNGAZiiPQB8XlBZHad9lKsFfrhm5zyKx2sTBWiT5Uxs08Sd0pQ'
  },
};

// /*
//  * For easier debugging in development mode, you can import the following file
//  * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
//  *
//  * This import should be commented out in production mode because it will have a negative impact
//  * on performance if an error is thrown.
//  */
// // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

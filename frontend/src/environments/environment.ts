import { auctionHouseAbi } from '../app/abi/AuctionHouse';
import { punkDataAbi } from '../app/abi/PunkData';
import { phunkTokenAbi } from '../app/abi/PhunkToken';

// // This file can be replaced during build by using the `fileReplacements` array.
// // `ng build` replaces `environment.ts` with `environment.prod.ts`.
// // The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  httpRpc: 'http://goerli-geth.dappnode:8545',
  graphURI: 'https://api.studio.thegraph.com/query/4302/crypto-phunks-auction-goerli/version/latest',
  abis: {
    auctionHouseAbi,
    punkDataAbi,
    phunkTokenAbi
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
    apiUrl: 'http://localhost:3200',
    vapidKey: 'BGHr7jzKtdWpY71z907UwcktW3UHz-1ToH5e-J08fzQfKnW7I_sxXUEmltWfd5yaKMr_oQpKYVY6oWZGtwhTjN4',
    // vapidKey: 'BGMg426N6tLVS6OsWuCxfewDOomVAcPLhi2KkUNGAZiiPQB8XlBZHad9lKsFfrhm5zyKx2sTBWiT5Uxs08Sd0pQ'
  },

  // httpRpc: 'http://geth.dappnode:8545',
  // wssRpc: 'wss://geth.dappnode:8546',
  // graphURI: 'https://gateway.thegraph.com/api/7209a22e64c7ef1706183bd515b9d15c/subgraphs/id/B58L1YUzPKRZ8GSkizgGDtH1vdtvem76jDVK4LipFTbi',
  // abis: {
  //   auctionHouseAbi,
  //   punkDataAbi,
  //   phunkTokenAbi
  // },
  // addresses: {
  //   // Auction house contract
  //   auctionHouseAddress: '0x0E7f7d8007C0FCcAc2a813a25f205b9030697856',
  //   // Punk Data Contract
  //   punkDataAddress: '0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2',
  //   // Treasurey Address (Where the phunks live)
  //   treasuryWalletAddress: '0x61f874551c69f0E40c9f55219107B408C989aDEc',
  //   // CryptoPhunks Token Contract
  //   phunkTokenAddress: '0xf07468ead8cf26c752c676e43c814fee9c8cf402'
  // },
  // chainId: 1,
  // auctionStartBlock: 15225534,
  // notifications: {
  //   apiUrl: 'https://goerli.phunks.auction/api',
  //   // apiUrl: 'http://localhost:3200',
  //   vapidKey: 'BGHr7jzKtdWpY71z907UwcktW3UHz-1ToH5e-J08fzQfKnW7I_sxXUEmltWfd5yaKMr_oQpKYVY6oWZGtwhTjN4',
  // },
};

// /*
//  * For easier debugging in development mode, you can import the following file
//  * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
//  *
//  * This import should be commented out in production mode because it will have a negative impact
//  * on performance if an error is thrown.
//  */
// // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

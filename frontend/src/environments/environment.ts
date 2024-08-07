// // This file can be replaced during build by using the `fileReplacements` array.
// // `ng build` replaces `environment.ts` with `environment.prod.ts`.
// // The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  httpRpc: 'http://nethermind.public.dappnode:8545',
  wssRpc: 'wss://geth.dappnode:8546',
  graphURI: 'https://gateway-arbitrum.network.thegraph.com/api/7209a22e64c7ef1706183bd515b9d15c/subgraphs/id/CDkJ2KXjaMEtt91EWsnH3aVYgWYf9usVPYCspnmexGdj',
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
  chainId: 1,
  projectId: '260e2bfb25e604e64f4ebd6eec1bb3d8',
  auctionStartBlock: 15225534,
  notifications: {
    apiUrl: 'https://staging.phunks.auction/api',
    // apiUrl: 'http://localhost:3200',
    vapidKey: 'BGHr7jzKtdWpY71z907UwcktW3UHz-1ToH5e-J08fzQfKnW7I_sxXUEmltWfd5yaKMr_oQpKYVY6oWZGtwhTjN4',
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

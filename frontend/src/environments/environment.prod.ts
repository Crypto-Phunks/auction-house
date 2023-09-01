import auctionHouseABI from '../app/abi/AuctionHouse.json';
import punkDataABI from '../app/abi/PunkData.json';
import phunkTokenABI from '../app/abi/PhunkToken.json';

export const environment = {
  production: true,
  httpRpc: 'https://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  wssRpc: 'wss://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  graphURI: 'https://gateway.thegraph.com/api/7209a22e64c7ef1706183bd515b9d15c/subgraphs/id/B58L1YUzPKRZ8GSkizgGDtH1vdtvem76jDVK4LipFTbi',
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

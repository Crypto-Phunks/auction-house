import auctionHouseABI from '../app/abi/AuctionHouse.json';
import punkDataABI from '../app/abi/PunkData.json';

export const environment = {
  production: true,
  httpRpc: 'https://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  wssRpc: 'wss://eth-mainnet.g.alchemy.com/v2/tBFG98iJPUBA1DUzkXDLlgaW8ms5qoqR',
  abis: {
    auctionHouseABI,
    punkDataABI
  },
  addresses: {
    // Auction house contract    
    auctionHouseAddress: '0x0E7f7d8007C0FCcAc2a813a25f205b9030697856',
    // Punk Data Contract
    punkDataAddress: '0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2',
    // Treasurey Address (Where the phunks live)
    treasuryWalletAddress: '0x61f874551c69f0E40c9f55219107B408C989aDEc',
  },
  network: 'mainnet',
  auctionStartBlock: 15225534
};
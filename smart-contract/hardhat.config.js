/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
   solidity: {
      version: "0.8.15",
      settings: {
      optimizer: {
      enabled: true,
      runs: 200,
      },
    },
   },
   defaultNetwork: "mainnet",
   networks: {
      hardhat: {},
      mainnet: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
   etherscan: {
    apiKey: ""
   }
}
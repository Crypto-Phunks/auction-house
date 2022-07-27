async function main() {
    // Grab the contract factory 
    const auctionContract = await ethers.getContractFactory("PhunksAuctionHouse");
 
    // Start deployment, returning a promise that resolves to a contract object
    const auctionHouse = await auctionContract.deploy();
    console.log("Contract deployed to address:", auctionHouse.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });
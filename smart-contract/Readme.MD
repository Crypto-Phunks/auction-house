Release Notes: 
1. Treasury wallet must setApprovalForAll() on contract of collection being auctioned.

2. Contract must call initialize() from the Auction House contract.
_phunks => contract address of collection being auctioned.
_weth => contract address of wrapped eth contract.
_timeBuffer => the minimum amount of seconds left after a bid.
    ex: _timeBuffer = 300 (5 minutes) will reset 'time left' on auction to 5 minutes if bid is made with less than 5 minutes remaining on auction.
_reservePrice => the minimum price an NFT will sell for.
_minBidIncrementPercentage => the percentage above the current bid. New bid must be greater or equal to current bid + (current bid * minBidIncrementPercentage).
_duration => the amount of time, in seconds, an auction will last
_treasuryWallet => wallet address holding NFTs to be auctioned and ETH collected from auctions.

3. Once steps 1 and 2 are complete, call unpause() to begin perpetual auctions.

4. CreateAuction() generates a random number to select an NFT to be auctioned from the Treasury Wallet.

5. For the duration of the auction, anyone can place bids on the NFT in ETH. The ETH is held in escrow on the Auction House smart contract.

6. If someone outbid, funds automatically returned. Only the highest bid is held in escrow on the Auction House smart contract.

7. At the conclusion of an auction, the ETH will remain in escrow until settleCurrentAndCreateNewAuction() or settleAuction() are called which will also transfer the NFT from the treasury to winning bidder.

8. When 'unpaused' is true, only settleCurrentAndCreateNewAuction() can be called. Assets from previous auction are sent trustlessly before creating a new auction.

9. When 'paused' is true, only settleAuction() can be called. Assets from previous auction are sent trustlessly, but a new auction is not created.

10. When 'paused' is true createSpecialAuction() can be called by PhunksAuctionHouse contract owner.

11. To auction specific tokenID: first call pause(), then settleAuction(), then call createSpecialAuction() and specify tokenID and endTime (in seconds).

12. Once special auction has started, call unpause() to resume perpetual auctions at the conclusion of the Special Auction.

13. Line 238 in PhunksAuctionHouse.sol excludes the 7-trait Phunk (#8348) from random selection.

14. When only one NFT remains in the treasury, it will auction that last NFT, and if settleCurrentAndCreateNew() is called you will get hit with a gas error bc there are no NFTs remaining to create a new auction.

15. When zero NFTs remain in the treasury: call pause() to pause the contract and then call settleAuction() to trustlessly send ETH to treasury and the last Phunk to auction winner.



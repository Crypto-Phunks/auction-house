import dotenv from 'dotenv';
dotenv.config();

export const auctionHouse = {
  address: process.env.AUCTION_CONTRACT_ADDRESS,
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'phunkId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'auctionId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'extended',
          type: 'bool',
        },
      ],
      name: 'AuctionBid',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'phunkId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'auctionId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'startTime',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'endTime',
          type: 'uint256',
        },
      ],
      name: 'AuctionCreated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'duration',
          type: 'uint256',
        },
      ],
      name: 'AuctionDurationUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'phunkId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'auctionId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'endTime',
          type: 'uint256',
        },
      ],
      name: 'AuctionExtended',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'minBidIncrementPercentage',
          type: 'uint256',
        },
      ],
      name: 'AuctionMinBidIncrementPercentageUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'reservePrice',
          type: 'uint256',
        },
      ],
      name: 'AuctionReservePriceUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'phunkId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'auctionId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'winner',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'AuctionSettled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'timeBuffer',
          type: 'uint256',
        },
      ],
      name: 'AuctionTimeBufferUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'Paused',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'Unpaused',
      type: 'event',
    },
    {
      inputs: [],
      name: 'auction',
      outputs: [
        { internalType: 'uint256', name: 'phunkId', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'uint256', name: 'startTime', type: 'uint256' },
        { internalType: 'uint256', name: 'endTime', type: 'uint256' },
        {
          internalType: 'address payable',
          name: 'bidder',
          type: 'address',
        },
        { internalType: 'bool', name: 'settled', type: 'bool' },
        { internalType: 'uint256', name: 'auctionId', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'auctionId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'phunkId', type: 'uint256' }],
      name: 'createBid',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_phunkId', type: 'uint256' },
        { internalType: 'uint256', name: '_endTime', type: 'uint256' },
      ],
      name: 'createSpecialAuction',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'duration',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract IPhunksToken',
          name: '_phunks',
          type: 'address',
        },
        { internalType: 'address', name: '_weth', type: 'address' },
        { internalType: 'uint256', name: '_timeBuffer', type: 'uint256' },
        { internalType: 'uint256', name: '_reservePrice', type: 'uint256' },
        {
          internalType: 'uint8',
          name: '_minBidIncrementPercentage',
          type: 'uint8',
        },
        { internalType: 'uint256', name: '_duration', type: 'uint256' },
        {
          internalType: 'address',
          name: '_treasuryWallet',
          type: 'address',
        },
      ],
      name: 'initialize',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'minBidIncrementPercentage',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'pause',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'paused',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'phunks',
      outputs: [
        { internalType: 'contract IPhunksToken', name: '', type: 'address' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'reservePrice',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_duration', type: 'uint256' }],
      name: 'setDuration',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_minBidIncrementPercentage',
          type: 'uint8',
        },
      ],
      name: 'setMinBidIncrementPercentage',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_reservePrice', type: 'uint256' },
      ],
      name: 'setReservePrice',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_timeBuffer', type: 'uint256' }],
      name: 'setTimeBuffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_treasuryWallet',
          type: 'address',
        },
      ],
      name: 'setTreasuryWallet',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'settleAuction',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'settleCurrentAndCreateNewAuction',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'timeBuffer',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'treasuryWallet',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'unpause',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'weth',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]  
};
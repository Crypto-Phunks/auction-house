import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { StateService } from './state.service';

import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { BigNumber, ContractInterface, ethers, Event, providers } from 'ethers';

import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      network: 'mainnet',
      rpc: {
        1: environment.httpRpc
      },
    }
  }
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions
});

@Injectable({
  providedIn: 'root'
})

export class Web3Service {

  private web3Connected = new BehaviorSubject<boolean>(false);
  web3Connected$ = this.web3Connected.asObservable();

  private activeWallet = new BehaviorSubject<string | undefined>(undefined);
  activeWallet$ = this.activeWallet.asObservable();

  // Set ethers provider (Alchemy)
  provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(environment.httpRpc);
  signer = this.provider.getSigner();

  // Initialize auction contract
  auctionHouseContract = new ethers.Contract(environment.addresses.auctionHouseAddress, environment.abis.auctionHouseABI as ContractInterface, this.signer);

  // Initialize auction contract
  punkDataContract = new ethers.Contract(environment.addresses.punkDataAddress, environment.abis.punkDataABI as ContractInterface, this.provider);

  // Initialize auction contract
  // phunkTokenContract = new ethers.Contract(environment.addresses.phunkTokenAddress, environment.abis.phunkTokenABI as ContractInterface, this.provider);

  minBidIncrementPercentage: number = 5;

  // treasuryValueEth!: BigNumber;

  constructor(
    private stateSvc: StateService
  ) {

    // Web3 connect
    web3Modal.on('connect', (instance) => {

      this.setWeb3Connected(true);
      this.setWalletAddress(instance?.selectedAddress);
      this.provider = new providers.Web3Provider(instance);
      this.signer = this.provider.getSigner();
      this.setContractInstances();
      this.getAuctionDetails();

      this.checkNetwork();
    });

    // Web3 disconnect
    web3Modal.on('disconnect', (instance) => {
      this.disconnect();
    });

    // The user has connected before
    if (web3Modal.cachedProvider) this.connect();

    this.auctionHouseContract.on('AuctionCreated', (
      phunkId: BigNumber,
      id: BigNumber,
      startTime: BigNumber,
      endTime: BigNumber,
      attributes: string,
      image: string
    ) => this.stateSvc.updateAuctionCreated(phunkId, id, startTime, endTime, attributes, image));

    this.auctionHouseContract.on('AuctionSettled', (
      phunkId: BigNumber,
      id: BigNumber,
      winner: string,
      amount: BigNumber
    ) => this.stateSvc.updateAuctionSettled(phunkId, id, winner, amount));

    this.auctionHouseContract.on('AuctionExtended', (
      phunkId: BigNumber,
      id: BigNumber,
      endTime: BigNumber
    ) => this.stateSvc.updateAuctionExtended(phunkId, id, endTime));

    this.auctionHouseContract.on('AuctionBid', (
      phunkId: BigNumber,
      id: BigNumber,
      sender: string,
      value: BigNumber,
      extended: boolean,
      event: Event
    ) => this.stateSvc.updateAuctionBid(phunkId, id, sender, value, extended, event));

    // this.treasuryValueEth =
    // this.getTreasuryValues();
  }

  // async getTreasuryValues(): Promise<void> {
  //   const balance = await this.phunkTokenContract['balanceOf'](environment.addresses.treasuryWalletAddress);
  //   console.log(Number(balance));
  //   // const etherPrice = await this.provider.getBalance(environment.addresses.treasuryWalletAddress);
  //   // console.log(Number(etherPrice));
  // }

  // Connection toggle (for UI)
  async connectDisconnect(): Promise<void> {
    const connected = await firstValueFrom(this.web3Connected$);
    if (connected) this.disconnect();
    else this.connect();
  }

  async connect(): Promise<void> {
    await web3Modal.connect();
  }

  async disconnect(): Promise<void> {
    web3Modal.clearCachedProvider();
    this.setWeb3Connected(false);
    this.setWalletAddress(undefined);
  }

  async checkNetwork(): Promise<any> {
    const activeNetwork = await this.provider.getNetwork();
    if (activeNetwork.chainId !== 1) {
      return await this.provider.send('wallet_switchEthereumChain', [{ chainId: '0x1' }]);
    }
  }

  async setContractInstances(): Promise<void> {
    this.auctionHouseContract = new ethers.Contract(
      environment.addresses.auctionHouseAddress,
      environment.abis.auctionHouseABI as ContractInterface,
      this.signer
    );

    this.punkDataContract = new ethers.Contract(
      environment.addresses.punkDataAddress,
      environment.abis.punkDataABI as ContractInterface,
      this.provider
    );
  }

  setWeb3Connected(val: boolean): void {
    this.web3Connected.next(val);
  }

  setWalletAddress(val: string | undefined): void {
    this.activeWallet.next(val);
  }

  async getAuctionDetails() {
    try {
      this.minBidIncrementPercentage = await this.auctionHouseContract['minBidIncrementPercentage']();
    } catch (err) {
      console.log(err);
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Punk Data Interactions ////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getPunkImage(tokenId: string): Promise<string | null> {
    try {
      return await this.punkDataContract['punkImage'](tokenId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getPunkAttributes(tokenId: string): Promise<string | null> {
    try {
      return await this.punkDataContract['punkAttributes'](tokenId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Auction Interactions //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getCurrentAuction(): Promise<any> {
    return await this.auctionHouseContract['auction']();
  }

  async setBid(tokenId: BigNumber, bidAmount: number): Promise<any> {

    const contract = this.auctionHouseContract.connect(this.signer);
    const value: BigNumber = this.ethToWei(bidAmount.toString());
    const estimateGas = await contract.estimateGas['createBid'](tokenId, { value });
    const gasLimit = estimateGas.add(estimateGas);

    return await contract['createBid'](tokenId, { value, gasLimit });
  }

  async startNewAuction(): Promise<any> {

    const contract = this.auctionHouseContract.connect(this.signer);
    const estimateGas = await contract.estimateGas['settleCurrentAndCreateNewAuction']();
    const gasLimit = estimateGas.add(estimateGas);
    // console.log(Number(estimateGas), Number(gasLimit));

    return await contract['settleCurrentAndCreateNewAuction']({ gasLimit });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // UTILS /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  weiToEth(wei: string): string {
    return ethers.utils.formatUnits(wei, 'ether');
  }

  ethToWei(eth: string) {
    return ethers.utils.parseEther(eth);
  }

  async getEns(address: string): Promise<string | null> {
    return await this.provider.lookupAddress(address);
  }

  async getCurrentBlock(): Promise<any> {
    return await this.provider.getBlockNumber();
  }

}

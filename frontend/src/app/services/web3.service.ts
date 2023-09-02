import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { StateService } from './state.service';

import { catchError, filter, Observable, of, tap } from 'rxjs';

import { FallbackTransport, TransactionReceipt, formatEther, formatUnits, parseEther } from 'viem';
import { mainnet, goerli } from 'viem/chains';

import { Chain, Config, PublicClient, WebSocketPublicClient, configureChains, createConfig, disconnect, getAccount, getNetwork, getPublicClient, getWalletClient, switchNetwork, watchAccount } from '@wagmi/core';

import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';

const projectId = '260e2bfb25e604e64f4ebd6eec1bb3d8';

@Injectable({
  providedIn: 'root'
})

export class Web3Service {

  config!: Config<PublicClient<FallbackTransport, Chain>, WebSocketPublicClient<FallbackTransport, Chain>>;
  connectors: any[] = [];
  web3modal!: Web3Modal;
  connectedState!: Observable<any>;

  minBidIncrementPercentage: number = 5;

  constructor(
    private stateSvc: StateService
  ) {

    const { chains, publicClient, webSocketPublicClient } = configureChains(
      [mainnet, goerli],
      [
        jsonRpcProvider({
          rpc: (chain) => ({ http: environment.httpRpc }),
        }),
      ],
    );

    this.connectors = [ ...w3mConnectors({ projectId, chains }) ];

    this.config = createConfig({
      autoConnect: true,
      publicClient,
      webSocketPublicClient,
      connectors: this.connectors
    });

    const ethereumClient = new EthereumClient(this.config, chains);
    this.web3modal = new Web3Modal(
      {
        projectId,
        themeVariables: {
          '--w3m-font-family': 'Montserrat, sans-serif',
          '--w3m-accent-color': 'rgba(var(--pink), 1)',
          '--w3m-accent-fill-color': 'rgba(var(--text-color), 1)',
          '--w3m-background-color': 'rgba(var(--background), 1)',
          '--w3m-overlay-background-color': 'rgba(var(--background), .5)',
          '--w3m-z-index': '2000',
          '--w3m-wallet-icon-border-radius': '0',
          '--w3m-background-border-radius': '0',
          '--w3m-button-border-radius': '0',
          '--w3m-button-hover-highlight-border-radius': '0',
          '--w3m-container-border-radius': '0',
          '--w3m-icon-button-border-radius': '0',
          '--w3m-secondary-button-border-radius': '0',
        }
      },
      ethereumClient
    );

    this.createListeners();
    this.getTreasuryValues();
    this.getAuctionDetails();
  }

  createListeners(): void {
    this.connectedState = new Observable((observer) => watchAccount((account) => observer.next(account)));
    this.connectedState.pipe(
      tap((account) => { if (account.isDisconnected) this.disconnectWeb3(); }),
      filter((account) => account.isConnected),
      tap((account) => {
        this.connectWeb3(account.address as string);
      }),
      catchError((err) => {
        this.disconnectWeb3();
        return of(err);
      }),
    ).subscribe();
  }

  async connect(): Promise<void> {
    try {
      await this.web3modal.openModal();
    } catch (error) {
      console.log(error);
      this.disconnectWeb3();
    }
  }

  async connectWeb3(address: string): Promise<void> {
    if (!address) return;
    address = address.toLowerCase();

    this.stateSvc.setWeb3Connected(true);
    this.setWalletAddress(address);
  }

  async disconnectWeb3(): Promise<void> {
    if (getAccount().isConnected) {
      await disconnect();
      this.stateSvc.setWeb3Connected(false);
      this.stateSvc.setWalletAddress(null);
    }
  }

  async checkNetwork(): Promise<void> {
    const network = getNetwork();
    if (network.chain?.id !== environment.chainId) {
      await switchNetwork({ chainId: environment.chainId });
    }
  }

  setWeb3Connected(val: boolean): void {
    this.stateSvc.setWeb3Connected(val);
  }

  setWalletAddress(val: string | null): void {
    this.stateSvc.setWalletAddress(val);
  }

  async getTreasuryValues(): Promise<void> {
    const usdcAbi: any = [{"inputs": [{ "internalType": "address", "name": "account", "type": "address" }],"name": "balanceOf","outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],"stateMutability": "view","type": "function"},{"inputs": [],"name": "decimals","outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],"stateMutability": "view","type": "function"}];

    try {
      const publicClient = getPublicClient();
      const [balance, [usdcValue, decimals]] = await Promise.all([
        publicClient.getBalance({
          address: environment.addresses.treasuryWalletAddress as `0x${string}`,
        }),
        publicClient.multicall({
          contracts: [{
            address: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` as `0x${string}`,
            abi: usdcAbi,
            functionName: 'balanceOf',
            args: [environment.addresses.treasuryWalletAddress],
          }, {
            address: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` as `0x${string}`,
            abi: usdcAbi,
            functionName: 'decimals',
            args: [],
          }],
        })
      ]);

      const formattedUsdcValue = formatUnits(
        usdcValue.result as unknown as bigint || BigInt(0),
        decimals.result as unknown as number || 0
      );

      this.stateSvc.updateTreasuryBalance({ usdc: formattedUsdcValue, eth: formatEther(balance) });
    } catch (error) {
      console.log(error);
      this.stateSvc.updateTreasuryBalance({ usdc: '0', eth: '0' });
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Punk Data Interactions ////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getPunkImage(tokenId: string): Promise<string | null> {
    const publicClient = getPublicClient();
    const punkImage = await publicClient?.readContract({
      address: environment.addresses.punkDataAddress as `0x${string}`,
      abi: environment.abis.punkDataABI,
      functionName: 'punkImage',
      args: [tokenId],
    });
    return punkImage as string;
  }

  async getPunkAttributes(tokenId: string): Promise<string | null> {
    const publicClient = getPublicClient();
    const punkAttributes = await publicClient?.readContract({
      address: environment.addresses.punkDataAddress as `0x${string}`,
      abi: environment.abis.punkDataABI,
      functionName: 'punkAttributes',
      args: [tokenId],
    });
    return punkAttributes as string;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Auction Interactions //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getAuctionDetails() {
    const publicClient = getPublicClient();
    const res = await publicClient?.readContract({
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: environment.abis.auctionHouseABI,
      functionName: 'minBidIncrementPercentage',
      args: [],
    });
    this.minBidIncrementPercentage = res as number;
  }

  async getCurrentAuction(): Promise<any> {
    const publicClient = getPublicClient();
    return await publicClient?.readContract({
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: environment.abis.auctionHouseABI,
      functionName: 'auction',
      args: [],
    });
  }

  async setBid(tokenId: bigint, bidAmount: number): Promise<`0x${string}` | undefined> {

    const network = getNetwork();
    const walletClient = await getWalletClient({ chainId: network.chain?.id });

    const tx: any = {
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: environment.abis.auctionHouseABI,
      functionName: 'createBid',
      args: [tokenId]
    };

    if (bidAmount) tx.value = parseEther(bidAmount.toString(), 'wei');
    return await walletClient?.writeContract(tx);
  }

  async startNewAuction(): Promise<`0x${string}` | undefined> {
    const network = getNetwork();
    const walletClient = await getWalletClient({ chainId: network.chain?.id });

    const tx: any = {
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: environment.abis.auctionHouseABI,
      functionName: 'settleCurrentAndCreateNewAuction',
      args: []
    };

    return await walletClient?.writeContract(tx);
  }

  async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    const publicClient = getPublicClient();
    const transaction = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
    return transaction;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // UTILS /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  weiToEth(wei: bigint): string {
    return formatEther(wei);
  }

  async getEnsOwner(name: string) {
    return await getPublicClient().getEnsAddress({ name });
  }

  async getEnsFromAddress(address: string | null | undefined): Promise<string | null> {
    if (!address) return null;
    try {
      const ens = await getPublicClient().getEnsName({ address: address as `0x${string}` });
      return ens;
    } catch (err) {
      return null;
    }
  }
}

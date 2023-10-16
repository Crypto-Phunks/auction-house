import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { environment } from 'src/environments/environment';

import { catchError, filter, Observable, of, tap } from 'rxjs';

import { FallbackTransport, TransactionReceipt, formatEther, formatUnits, parseEther } from 'viem';

import { mainnet, goerli } from 'viem/chains';

import { Chain, Config, InjectedConnector, PublicClient, WebSocketPublicClient, configureChains, createConfig, disconnect, getAccount, getNetwork, getPublicClient, getWalletClient, switchNetwork, watchAccount } from '@wagmi/core';

import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';

import { createWeb3Modal, EIP6963Connector } from '@web3modal/wagmi';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';

import { GlobalState } from '@/interfaces/global-state';
import { Treasury } from '@/interfaces/treasury';
import { Auction } from '@/interfaces/auction';

import * as actions from '@/state/actions/app-state.action';

const projectId = environment.projectId;

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
    private store: Store<GlobalState>,
  ) {

    const metadata = {
      name: 'CryptoPunks Auction House',
      description: '',
      url: 'https://phunks.auction',
    };

    const { chains, publicClient } = configureChains(
      [mainnet, goerli],
      [
        jsonRpcProvider({
          rpc: (chain) => ({ http: environment.httpRpc }),
        }),
      ],
    );

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: [
        new WalletConnectConnector({ chains, options: { projectId, showQrModal: false }}),
        new EIP6963Connector({ chains }),
        new InjectedConnector({ chains, options: { shimDisconnect: true } }),
        new CoinbaseWalletConnector({ chains, options: { appName: metadata.name }}),
      ],
      publicClient
    });

    this.web3modal = createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      themeVariables: {
        '--w3m-font-family': 'Montserrat, sans-serif',
        '--w3m-accent': 'rgba(var(--active-color), 1)',
        '--w3m-color-mix': 'rgba(var(--active-color), 1)',
        '--w3m-color-mix-strength': 0,
        '--w3m-border-radius-master': '0',
        '--w3m-z-index': 2000,
      },
    });

    this.createListeners();
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
      await this.web3modal.open();
    } catch (error) {
      console.log(error);
      this.disconnectWeb3();
    }
  }

  async connectWeb3(address: string): Promise<void> {
    if (!address) return;
    address = address.toLowerCase();

    this.store.dispatch(actions.setConnected({ connected: true }));
    this.store.dispatch(actions.setWalletAddress({ walletAddress: address }));
  }

  async disconnectWeb3(): Promise<void> {
    if (getAccount().isConnected) {
      await disconnect();

      this.store.dispatch(actions.setConnected({ connected: false }));
      this.store.dispatch(actions.setWalletAddress({ walletAddress: '' }));
    }
  }

  async checkNetwork(): Promise<void> {
    const network = getNetwork();
    if (network.chain?.id !== environment.chainId) {
      await switchNetwork({ chainId: environment.chainId });
    }
  }

  async fetchTreasuryValues(): Promise<Treasury> {
    const usdcAbi: any = [{"inputs": [{ "internalType": "address", "name": "account", "type": "address" }],"name": "balanceOf","outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],"stateMutability": "view","type": "function"},{"inputs": [],"name": "decimals","outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],"stateMutability": "view","type": "function"}] as const;

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

      if (!decimals.result || !usdcValue.result) throw new Error('No balance found');

      const formattedUsdcValue = formatUnits(
        usdcValue.result as any, // String (bigint)
        decimals.result as any, // Number
      );

      return { usdc: formattedUsdcValue, eth: formatEther(balance) };
    } catch (error) {
      console.log(error);
    }

    return { usdc: '0', eth: '0' };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Punk Data Interactions ////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getPunkImage(tokenId: string): Promise<string | null> {
    const publicClient = getPublicClient();
    const punkImage = await publicClient?.readContract({
      address: environment.addresses.punkDataAddress as `0x${string}`,
      abi: [{
        inputs: [{ internalType: 'uint16', name: 'index', type: 'uint16' }],
        name: 'punkImage',
        outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'punkImage',
      args: [Number(tokenId)],
    });
    return punkImage as string;
  }

  async getPunkAttributes(tokenId: string): Promise<string | null> {
    const publicClient = getPublicClient();
    const punkAttributes = await publicClient?.readContract({
      address: environment.addresses.punkDataAddress as `0x${string}`,
      abi: [{
        inputs: [{ internalType: 'uint16', name: 'index', type: 'uint16' }],
        name: 'punkAttributes',
        outputs: [{ internalType: 'string', name: 'text', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'punkAttributes',
      args: [Number(tokenId)],
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
      abi: [{
        inputs: [],
        name: 'minBidIncrementPercentage',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'minBidIncrementPercentage',
    });
    this.minBidIncrementPercentage = res as number;
  }

  async getCurrentAuction(): Promise<any> {
    const publicClient = getPublicClient();
    return await publicClient?.readContract({
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: [{
        inputs: [],
        name: 'auction',
        outputs: [
          { internalType: 'uint256', name: 'phunkId', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'address payable', name: 'bidder', type: 'address' },
          { internalType: 'bool', name: 'settled', type: 'bool' },
          { internalType: 'uint256', name: 'auctionId', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'auction',
    });
  }

  typedAuction(auction: any[]): Auction {
    return {
      phunkId: Number(auction[0]).toString(),
      amount: auction[1],
      startTime: Number(auction[2]) * 1000,
      endTime: Number(auction[3]) * 1000,
      bidder: auction[4],
      settled: auction[5],
      id: Number(auction[6]).toString(),
      bids: []
    };
  }

  async setBid(tokenId: bigint, bidAmount: number): Promise<`0x${string}` | undefined> {

    const network = getNetwork();
    const walletClient = await getWalletClient({ chainId: network.chain?.id });

    const tx: any = {
      address: environment.addresses.auctionHouseAddress as `0x${string}`,
      abi: [{
        inputs: [{ internalType: 'uint256', name: 'phunkId', type: 'uint256' }],
        name: 'createBid',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      }],
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
      abi: [{
        inputs: [],
        name: 'settleCurrentAndCreateNewAuction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }],
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

  weiToEth(wei: string): string {
    return formatEther(BigInt(wei));
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

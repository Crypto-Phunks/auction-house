import { Log } from 'viem';

import { Auction } from './auction';
import { Treasury } from './treasury';

export type Theme = 'dark' | 'light';

export interface GlobalState {
  appState: AppState;
}

export interface AppState {
  walletAddress: string;
  connected: boolean;
  theme: Theme | null;
  treasuryValues: Treasury | null;

  activeAuction: Auction | null;
  activeColor: string | null;
  activeIndex: number;

  auctions: Auction[] | null;
  logs: Log[];
}

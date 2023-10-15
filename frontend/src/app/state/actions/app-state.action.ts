import { createAction, props } from '@ngrx/store';

import { AppState } from '@/interfaces/global-state';

export const setConnected = createAction(
  '[App State] Set Wallet Connected',
  props<{ connected: boolean }>()
);

export const setWalletAddress = createAction(
  '[App State] Set Wallet Address',
  props<{ walletAddress: AppState['walletAddress'] }>()
);

export const setTheme = createAction(
  '[App State] Set Theme',
  props<{ theme: AppState['theme'] }>()
);

export const fetchTreasuryValues = createAction(
  '[App State] Fetch Treasury Values'
);

export const setTreasuryValues = createAction(
  '[App State] Set Treasury Values',
  props<{ treasuryValues: AppState['treasuryValues'] }>()
);

export const resetAppState = createAction(
  '[App State] Reset App State'
);

export const fetchAuctions = createAction(
  '[App State] Fetch All Auctions'
);

export const setAuctions = createAction(
  '[App State] Set Past Auctions',
  props<{ auctions: AppState['auctions'] }>()
);

export const setActiveAuction = createAction(
  '[App State] Set Active Auction',
  props<{ activeAuction: AppState['activeAuction'] }>()
);

export const contractEvent = createAction(
  '[App State] Contract Event',
  props<{ logs: AppState['logs'] }>()
);

export const setActiveColor = createAction(
  '[App State] Set Active Color',
  props<{ color: AppState['activeColor'] }>()
);

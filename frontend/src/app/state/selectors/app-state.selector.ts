import { createSelector } from '@ngrx/store';

import { GlobalState, AppState } from '@/interfaces/global-state';

export const selectAppState = (state: GlobalState) => state.appState;

export const selectLoaded = createSelector(
  selectAppState,
  (appState: AppState) => appState.loaded
);

export const selectConnected = createSelector(
  selectAppState,
  (appState: AppState) => appState.connected
);

export const selectWalletAddress = createSelector(
  selectAppState,
  (appState: AppState) => appState.walletAddress
);

export const selectTheme = createSelector(
  selectAppState,
  (appState: AppState) => appState.theme
);

export const selectTreasuryValues = createSelector(
  selectAppState,
  (appState: AppState) => appState.treasuryValues
);

export const selectAuctions = createSelector(
  selectAppState,
  (appState: AppState) => appState.auctions
);

export const selectActiveAuction = createSelector(
  selectAppState,
  (appState: AppState) => appState.activeAuction
);

export const selectActiveColor = createSelector(
  selectAppState,
  (appState: AppState) => appState.activeColor
);

export const selectActiveIndex = createSelector(
  selectAppState,
  (appState: AppState) => appState.activeIndex
);

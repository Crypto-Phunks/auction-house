import { AppState, Theme } from '@/interfaces/global-state';
import { Action, ActionReducer, createReducer, on } from '@ngrx/store';

import * as AppStateActions from '../actions/app-state.action';

export const initialState: AppState = {
  loaded: false,

  connected: false,
  walletAddress: '',
  theme: null,
  treasuryValues: null,

  activeAuction: null,
  activeColor: null,
  activeIndex: 0,

  auctions: null,
  logs: [],
};

export const appStateReducer: ActionReducer<AppState, Action> = createReducer(
  initialState,
  on(AppStateActions.resetAppState, () => initialState),
  // Set the loaded state
  on(AppStateActions.setLoaded, (state, { loaded }) => {
    const setLoaded = {
      ...state,
      loaded,
    };
    // console.log('setLoaded', setLoaded);
    return setLoaded;
  }),
  // Set the wallet connected
  on(AppStateActions.setConnected, (state, { connected }) => {
    const setConnected = {
      ...state,
      connected,
    };
    // console.log('setConnected', setConnected);
    return setConnected;
  }),
  // Set the wallet address
  on(AppStateActions.setWalletAddress, (state, { walletAddress }) => {
    const setWalletAddress = {
      ...state,
      walletAddress: walletAddress.toLowerCase(),
    };
    // console.log('setWalletAddress', setWalletAddress);
    return setWalletAddress;
  }),
  // Set the theme
  on(AppStateActions.setTheme, (state, { theme }) => {
    const setTheme = {
      ...state,
      theme,
    };
    // console.log('setTheme', setTheme);
    return setTheme;
  }),
  // Set the treasury balance
  on(AppStateActions.setTreasuryValues, (state, { treasuryValues }) => {
    const setTreasuryValues = {
      ...state,
      treasuryValues,
    };
    // console.log('setTreasuryValues', setTreasuryValues);
    return setTreasuryValues;
  }),
  // Set the past auctions
  on(AppStateActions.setAuctions, (state, { auctions }) => {
    const setAuctions = {
      ...state,
      auctions,
    };
    // console.log('setPastAuctions', setPastAuctions);
    return setAuctions;
  }),
  // Set the active auction
  on(AppStateActions.setActiveAuction, (state, { activeAuction }) => {
    const setActiveAuction = {
      ...state,
      activeAuction,
    };
    // console.log('setActiveAuction', setActiveAuction);
    return setActiveAuction;
  }),
  // Set the active color
  on(AppStateActions.setActiveColor, (state, { color }) => {
    const setActiveColor = {
      ...state,
      activeColor: color,
    };
    // console.log('setActiveColor', setActiveColor);
    return setActiveColor;
  }),
);

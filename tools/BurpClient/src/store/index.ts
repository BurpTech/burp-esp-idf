import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {zeroconf} from './zeroconf';
import {foundDevices} from './foundDevices';
import {devicesApi} from '../services/devicesApi.ts';
import {resolvedDevices} from './resolvedDevices';

export const store = configureStore({
  reducer: {
    zeroconf: zeroconf.reducer,
    foundDevices: foundDevices.reducer,
    resolvedDevices: resolvedDevices.reducer,
    [devicesApi.reducerPath]: devicesApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(devicesApi.middleware),
});

export type BurpState = ReturnType<typeof store.getState>;
export type BurpDispatch = typeof store.dispatch;
export type BurpThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  BurpState,
  unknown,
  Action<string>
>;

export const useBurpDispatch = () => useDispatch<BurpDispatch>();
export const useBurpSelector: TypedUseSelectorHook<BurpState> = useSelector;

export const selectZeroconfState = (state: BurpState) => state.zeroconf;
export const selectFoundDevicesState = (state: BurpState) => state.foundDevices;
export const selectResolvedDevicesState = (state: BurpState) =>
  state.resolvedDevices;

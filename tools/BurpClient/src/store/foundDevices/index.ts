import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';
import {Cleanable} from '../../services/Cleaner.ts';

export type FoundDevice = Cleanable;

export const foundDevicesAdapter = createEntityAdapter<FoundDevice, string>({
  selectId: device => device.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

export const foundDevices = createSlice({
  name: 'devices',
  initialState: foundDevicesAdapter.getInitialState(),
  reducers: {
    addFoundDevice: foundDevicesAdapter.setOne,
    removeFoundDevice: foundDevicesAdapter.removeOne,
  },
});

export const {addFoundDevice, removeFoundDevice} = foundDevices.actions;

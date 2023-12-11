import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';

export interface Resolved {
  addresses: string[];
  name: string;
  fullName: string;
  port: number;
}

export interface Device {
  host: string;
  resolved?: Resolved;
}

export const devicesAdapter = createEntityAdapter({
  selectId: (device: Device) => device.host,
  sortComparer: (a, b) => a.host.localeCompare(b.host),
});

export const devices = createSlice({
  name: 'devices',
  initialState: devicesAdapter.getInitialState(),
  reducers: {
    addFound: devicesAdapter.addOne, // don't add if already present
    addResolved: devicesAdapter.setOne, // add or replace
  },
});

export const {addFound, addResolved} = devices.actions;

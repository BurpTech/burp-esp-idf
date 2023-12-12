import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';
import {Service} from 'react-native-zeroconf';

export interface Config {
  alias: string;
}

export interface Device {
  name: string;
  service?: Service;
  config?: Config;
}

export const devicesAdapter = createEntityAdapter({
  selectId: (device: Device) => device.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
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

import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';
import {Service} from 'react-native-zeroconf';
import {Cleanable} from '../../services/Cleaner.ts';

export type ResolvedDevice = Cleanable & {
  service: Service;
};

export const resolvedDevicesAdapter = createEntityAdapter<
  ResolvedDevice,
  string
>({
  selectId: resolvedDevice => resolvedDevice.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

export const resolvedDevices = createSlice({
  name: 'resolvedDevices',
  initialState: resolvedDevicesAdapter.getInitialState(),
  reducers: {
    addResolvedDevice: resolvedDevicesAdapter.setOne,
    removeResolvedDevice: resolvedDevicesAdapter.removeOne,
  },
});

export const {addResolvedDevice, removeResolvedDevice} =
  resolvedDevices.actions;

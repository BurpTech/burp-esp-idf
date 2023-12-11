import {devicesAdapter} from './index.ts';
import {selectDevicesState} from '../index.ts';

export const {selectAll: selectDevices, selectById: selectDeviceById} =
  devicesAdapter.getSelectors(selectDevicesState);

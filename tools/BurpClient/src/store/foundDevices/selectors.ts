import {foundDevicesAdapter} from './index.ts';
import {selectFoundDevicesState} from '../index.ts';

export const {
  selectAll: selectFoundDevices,
  selectById: selectFoundDeviceById,
} = foundDevicesAdapter.getSelectors(selectFoundDevicesState);

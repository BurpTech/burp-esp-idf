import {resolvedDevicesAdapter} from './index.ts';
import {selectResolvedDevicesState} from '../index.ts';

export const {
  selectAll: selectResolvedDevices,
  selectById: selectResolvedDeviceById,
} = resolvedDevicesAdapter.getSelectors(selectResolvedDevicesState);

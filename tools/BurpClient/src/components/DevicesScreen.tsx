import React from 'react';
import {ResolvedDevices} from './ResolvedDevices.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BurpStackParamList,
  DEVICE_ROUTE_NAME,
  DEVICES_ROUTE_NAME,
} from './BurpNavigation.tsx';

type Props = NativeStackScreenProps<
  BurpStackParamList,
  typeof DEVICES_ROUTE_NAME
>;

export function DevicesScreen({navigation}: Props) {
  return (
    <ResolvedDevices
      onPress={device => navigation.navigate(DEVICE_ROUTE_NAME, {device})}
    />
  );
}

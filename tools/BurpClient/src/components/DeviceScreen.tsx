import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BurpStackParamList, DEVICE_ROUTE_NAME} from './BurpNavigation.tsx';
import {Text, View} from 'react-native';

type Props = NativeStackScreenProps<
  BurpStackParamList,
  typeof DEVICE_ROUTE_NAME
>;

export function DeviceScreen({route}: Props) {
  const {device} = route.params;

  return (
    <View>
      <Text>{device.name}</Text>
    </View>
  );
}

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Device} from '../store/devices';
import {NavigationContainer} from '@react-navigation/native';
import {DevicesScreen} from './DevicesScreen.tsx';
import {DeviceScreen} from './DeviceScreen.tsx';

export const DEVICES_ROUTE_NAME = 'Devices';
export const DEVICE_ROUTE_NAME = 'Device';

export type BurpStackParamList = {
  [DEVICES_ROUTE_NAME]: undefined;
  [DEVICE_ROUTE_NAME]: {
    device: Device;
  };
};

const Stack = createNativeStackNavigator<BurpStackParamList>();

export function BurpNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={DEVICES_ROUTE_NAME}
          component={DevicesScreen}
          options={{title: 'Burp Devices'}}
        />
        <Stack.Screen
          name={DEVICE_ROUTE_NAME}
          component={DeviceScreen}
          options={({route}) => ({title: route.params.device.name})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

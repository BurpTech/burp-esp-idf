import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BurpStackParamList, DEVICE_ROUTE_NAME} from './BurpNavigation.tsx';
import {Text, View} from 'react-native';
import {useGetConfigQuery} from '../services/devicesApi.ts';

type Props = NativeStackScreenProps<
  BurpStackParamList,
  typeof DEVICE_ROUTE_NAME
>;

export function DeviceScreen({route}: Props) {
  const {device} = route.params;
  const {data, error, isLoading} = useGetConfigQuery(device);
  let count = 0;

  if (error) console.log(error);

  return (
    <View>
      <Text>{device.id}</Text>
      {device.service !== undefined && (
        <View>
          <Text>{device.service.name}</Text>
          <Text>{device.service.host}</Text>
          <Text>{device.service.port}</Text>
          <Text>{device.service.fullName}</Text>
          {Object.entries(device.service.txt).map(entry => (
            <Text key={entry[0]}>
              {entry[0]}: {entry[1]}
            </Text>
          ))}
          {device.service.addresses.map(address => (
            <Text key={count++}>{address}</Text>
          ))}
        </View>
      )}
      <View>
        {error ? (
          <Text>Error loading config</Text>
        ) : isLoading ? (
          <Text>Loading config...</Text>
        ) : data ? (
          <>
            <Text>{data.alias}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

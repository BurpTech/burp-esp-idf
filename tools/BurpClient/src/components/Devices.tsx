import React from 'react';
import {FlatList} from 'react-native';
import {useBurpSelector} from '../store';
import {selectDevices} from '../store/devices/selectors.ts';
import {DeviceItem} from './DeviceItem.tsx';
import {Device} from '../store/devices';

type Props = {
  onPress: (device: Device) => void;
};

export function Devices({onPress}: Props) {
  const devices = useBurpSelector(selectDevices);

  return (
    <FlatList
      data={devices}
      renderItem={({item}) => (
        <DeviceItem device={item} onPress={() => onPress(item)} />
      )}
      keyExtractor={item => item.name}
    />
  );
}

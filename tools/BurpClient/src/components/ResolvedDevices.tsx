import React from 'react';
import {FlatList} from 'react-native';
import {useBurpSelector} from '../store';
import {ResolvedDeviceItem} from './ResolvedDeviceItem.tsx';
import {FoundDevice} from '../store/foundDevices';
import {selectResolvedDevices} from '../store/resolvedDevices/selectors.ts';

type Props = {
  onPress: (device: FoundDevice) => void;
};

export function ResolvedDevices({onPress}: Props) {
  const resolvedDevices = useBurpSelector(selectResolvedDevices);

  return (
    <FlatList
      data={resolvedDevices}
      renderItem={({item}) => (
        <ResolvedDeviceItem device={item} onPress={() => onPress(item)} />
      )}
      keyExtractor={item => item.id}
    />
  );
}

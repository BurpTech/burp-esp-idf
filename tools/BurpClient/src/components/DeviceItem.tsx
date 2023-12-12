import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {Device} from '../store/devices';

const baseItemStyle = {
  padding: 20,
  marginVertical: 8,
  marginHorizontal: 16,
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  foundItem: {
    ...baseItemStyle,
    backgroundColor: 'gray',
  },
  resolvedItem: {
    ...baseItemStyle,
    backgroundColor: 'lightgray',
  },
  aliveItem: {
    ...baseItemStyle,
    backgroundColor: 'white',
  },
});

type Props = {
  device: Device;
  onPress: () => void;
};

export function DeviceItem({device, onPress}: Props) {
  const viewStyle =
    device.service === undefined
      ? styles.foundItem
      : device.config === undefined
      ? styles.resolvedItem
      : styles.aliveItem;

  return (
    <View style={viewStyle}>
      <Button title={device.name} onPress={onPress} />
    </View>
  );
}

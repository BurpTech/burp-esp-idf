import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {ResolvedDevice} from '../store/resolvedDevices';

const baseItemStyle = {
  padding: 20,
  marginVertical: 8,
  marginHorizontal: 16,
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  resolvedItem: {
    ...baseItemStyle,
    backgroundColor: 'white',
  },
});

type Props = {
  device: ResolvedDevice;
  onPress: () => void;
};

function Found({device}: Pick<Props, 'device'>) {
  return <Text>{device.id}</Text>;
}

function Resolved({device, onPress}: Props) {
  return <Button title={device.id} onPress={onPress} />;
}

export function ResolvedDeviceItem({device, onPress}: Props) {
  return (
    <View style={styles.resolvedItem}>
      {device.service ? (
        <Resolved device={device} onPress={onPress} />
      ) : (
        <Found device={device} />
      )}
    </View>
  );
}

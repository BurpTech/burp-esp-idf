import React from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import {useBurpSelector} from '../store';
import {selectDevices} from '../store/devices/selectors.ts';

const baseItemStyle = {
  backgroundColor: 'white',
  padding: 10,
  fontSize: 18,
  height: 44,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  foundItem: {
    ...baseItemStyle,
    color: 'gray',
  },
  resolvedItem: {
    ...baseItemStyle,
    color: 'black',
  },
});

export function Devices() {
  const devices = useBurpSelector(selectDevices);

  return (
    <FlatList
      data={devices}
      renderItem={({item}) => (
        <Text
          style={
            item.service !== undefined ? styles.resolvedItem : styles.foundItem
          }>
          {item.name}
        </Text>
      )}
    />
  );
}

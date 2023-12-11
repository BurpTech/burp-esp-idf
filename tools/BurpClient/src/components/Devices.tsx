import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useBurpSelector} from '../store';
import {selectDevices} from '../store/devices/selectors.ts';

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
    backgroundColor: 'white',
  },
});

export function Devices() {
  const devices = useBurpSelector(selectDevices);

  return (
    <FlatList
      data={devices}
      renderItem={({item}) => (
        <View
          style={
            item.service !== undefined ? styles.resolvedItem : styles.foundItem
          }>
          <Text style={styles.title}>{item.name}</Text>
        </View>
      )}
      keyExtractor={item => item.name}
    />
  );
}

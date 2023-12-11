import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useBurpSelector} from '../store';
import {selectDevices} from '../store/devices/selectors.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  item: {
    backgroundColor: 'white',
    color: 'black',
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export function Devices() {
  const devices = useBurpSelector(selectDevices);

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        renderItem={({item}) => <Text style={styles.item}>{item.host}</Text>}
      />
    </View>
  );
}

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useBurpSelector} from '../store';
import {
  selectZeroconfError,
  selectZeroconfStatus,
} from '../store/zeroconf/selectors.ts';

const styles = StyleSheet.create({
  status: {
    backgroundColor: 'white',
    color: 'black',
  },
  error: {
    backgroundColor: 'white',
    color: 'red',
  },
});

export function ZeroconfStatus() {
  const status = useBurpSelector(selectZeroconfStatus);
  const error = useBurpSelector(selectZeroconfError);

  return (
    <View>
      <Text style={styles.status}>{status}</Text>
      {error !== undefined && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

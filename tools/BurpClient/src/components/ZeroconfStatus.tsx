import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useBurpSelector} from '../store';
import {
  selectZeroconfError,
  selectZeroconfQuery,
  selectZeroconfStatus,
} from '../store/zeroconf/selectors.ts';

const styles = StyleSheet.create({
  status: {
    backgroundColor: 'white',
    color: 'black',
  },
  query: {
    backgroundColor: 'white',
    color: 'blue',
  },
  error: {
    backgroundColor: 'white',
    color: 'red',
  },
});

export function ZeroconfStatus() {
  const status = useBurpSelector(selectZeroconfStatus);
  const query = useBurpSelector(selectZeroconfQuery);
  const error = useBurpSelector(selectZeroconfError);

  return (
    <View>
      <Text style={styles.status}>{status}</Text>
      {query !== undefined && <Text style={styles.query}>{query}</Text>}
      {error !== undefined && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

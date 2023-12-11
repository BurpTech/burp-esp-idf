import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

import {Devices} from './components/Devices.tsx';
import {ZeroconfStatus} from './components/ZeroconfStatus.tsx';

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#F5FCFF',
    marginTop: StatusBar.currentHeight || 0,
  },
  contentContainer: {
    flex: 1, // pushes the footer to the end of the screen
  },
  footerContainer: {
    flex: 0,
  },
});

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.contentContainer}>
      <View style={styles.contentContainer}>
        <Devices />
      </View>
      <View style={styles.footerContainer}>
        <ZeroconfStatus />
      </View>
    </SafeAreaView>
  );
}

export default App;

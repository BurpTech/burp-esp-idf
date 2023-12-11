import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';

import {Devices} from './components/Devices.tsx';
import {ZeroconfStatus} from './components/ZeroconfStatus.tsx';

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar />
      <ZeroconfStatus />
      <Devices />
    </SafeAreaView>
  );
}

export default App;

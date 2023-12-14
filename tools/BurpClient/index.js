/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './src/store';
import React from 'react';
import {startZeroconf} from './src/services/zeroconf';
import {Cleaner} from './src/services/Cleaner';
import {removeFoundDevice} from './src/store/foundDevices';
import {selectFoundDevices} from './src/store/foundDevices/selectors';
import {selectResolvedDevices} from './src/store/resolvedDevices/selectors';
import {removeResolvedDevice} from './src/store/resolvedDevices';

AppRegistry.registerComponent(appName, () => () => (
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
));

startZeroconf();

const cleaner = new Cleaner([
  {
    selector: selectFoundDevices,
    removeActionCreator: removeFoundDevice,
  },
  {
    selector: selectResolvedDevices,
    removeActionCreator: removeResolvedDevice,
  },
]);

cleaner.start();

/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './src/store';
import React from 'react';
import {start} from './src/services/zeroconf';

AppRegistry.registerComponent(appName, () => () => (
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
));

start();

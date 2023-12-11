import Zeroconf from 'react-native-zeroconf';
import {store} from '../store';
import {setError, setIdle, setScanning} from '../store/zeroconf';
import {addFound, addResolved} from '../store/devices';

const INTERVAL_MS: number = 10000;
const SCAN_TIME_MS: number = 5000;

const SERVICE_TYPE = 'burptech';
const SERVICE_PROTOCOL = 'tcp';
const SERVICE_DOMAIN = 'local.';

const zeroconf = new Zeroconf();

zeroconf.on('start', () => {
  store.dispatch(setScanning());
});

zeroconf.on('stop', () => {
  store.dispatch(setIdle());
});

zeroconf.on('error', error => {
  store.dispatch(setError(error.message));
});

zeroconf.on('found', host => {
  store.dispatch(
    addFound({
      host,
    }),
  );
});

zeroconf.on('resolved', service => {
  store.dispatch(
    addResolved({
      host: service.host,
      resolved: service,
    }),
  );
});

function scan() {
  zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN);
  setTimeout(() => {
    zeroconf.stop();
  }, SCAN_TIME_MS);
}

export function start() {
  scan();
  setInterval(() => {
    scan();
  }, INTERVAL_MS);
}

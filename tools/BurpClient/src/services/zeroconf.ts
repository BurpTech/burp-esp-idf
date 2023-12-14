import Zeroconf from 'react-native-zeroconf';
import {store} from '../store';
import {setError, setIdle, setScanning} from '../store/zeroconf';
import {addFoundDevice} from '../store/foundDevices';
import {addResolvedDevice} from '../store/resolvedDevices';

const INTERVAL_MS: number = 10000;
const SCAN_TIME_MS: number = 5000;

const SERVICE_TYPE = 'burptech';
const SERVICE_PROTOCOL = 'tcp';
const SERVICE_DOMAIN = 'local.';

const QUERY = `${SERVICE_TYPE}: ${SERVICE_PROTOCOL}: ${SERVICE_DOMAIN}`;

const zeroconf = new Zeroconf();

zeroconf.on('start', () => {
  store.dispatch(setScanning(QUERY));
});

zeroconf.on('stop', () => {
  store.dispatch(setIdle());
});

zeroconf.on('error', error => {
  store.dispatch(
    setError({
      query: QUERY,
      message: error.message,
    }),
  );
});

zeroconf.on('found', name => {
  store.dispatch(
    addFoundDevice({
      id: name,
      timestamp: Date.now(),
    }),
  );
});

zeroconf.on('resolved', service => {
  store.dispatch(
    addResolvedDevice({
      id: service.name,
      service: service,
      timestamp: Date.now(),
    }),
  );
});

function scan() {
  zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN);
  setTimeout(() => {
    zeroconf.stop();
  }, SCAN_TIME_MS);
}

export function startZeroconf() {
  scan();
  setInterval(() => {
    scan();
  }, INTERVAL_MS);
}

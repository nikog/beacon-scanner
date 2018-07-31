import R, { compose } from 'ramda';
import Rx, { merge, fromEvent } from 'rxjs';
import { map, mapTo, filter } from 'rxjs/operators';
import noble from 'noble';

import { isBeacon, metaData, sensorData } from './beacon';
import { store } from './db';

const BEACON_UUIDS = [
  'f1c81b57ef4048f5a0e4e95f661bfcd7',
  '3eebdcae8a264fe1b8b0d2a89b89ee41'
];

const startScanning = () => noble.startScanning([], true);
const stopScanning = () => noble.stopScanning();

const logMeasurements = ({
  meta: { uuid },
  data: { humidity, temperature, pressure }
}) => {
  console.log(`
    UUID ${uuid}
    Humidity ${humidity} %
    Temperature ${temperature} C
    Air pressure ${pressure / 100} hPa
  `);
};

const mapObjectFormat = R.applySpec({
  meta: metaData,
  data: sensorData
});

const createLoggingStream = () =>
  merge(
    fromEvent(noble, 'scanStart').pipe(mapTo('Scan started')),
    fromEvent(noble, 'scanStop').pipe(mapTo('Scan stopped')),
    fromEvent(noble, 'warning')
  );

const createStateChangeStream = () => {
  const stateChange$ = fromEvent(noble, 'stateChange');

  const poweredOn$ = stateChange$.pipe(filter(state => state === 'poweredOn'));
  const poweredOff$ = stateChange$.pipe(filter(state => state !== 'poweredOn'));

  return [poweredOn$, poweredOff$];
};

const createDiscoverStream = () =>
  fromEvent(noble, 'discover').pipe(filter(isBeacon), map(mapObjectFormat));

createLoggingStream().subscribe(console.log);

const states$ = createStateChangeStream();
states$[0].subscribe(startScanning);
states$[1].subscribe(stopScanning);

createDiscoverStream().subscribe(logMeasurements);

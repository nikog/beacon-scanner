import R, { pathOr } from 'ramda';
import Rx from 'rxjs';
import { merge } from 'rxjs/observable/merge';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { map, mapTo, tap, partition, filter } from 'rxjs/operators';
import noble from 'noble';

import { manufacturerData, isBeacon, beaconObj, sensorObj } from './beacon';
import { store } from './db';

const BEACON_UUIDS = ['f1c81b57ef4048f5a0e4e95f661bfcd7', '3eebdcae8a264fe1b8b0d2a89b89ee41'];

const startScanning = () => noble.startScanning([], true);
const stopScanning = () => noble.stopScanning();

const logMeasurements = ({
  meta: { uuid }, data: { humidity, temperature, pressure },
}) => {
  console.log(`
    UUID ${uuid}
    Humidity ${humidity} %
    Temperature ${temperature} C
    Air pressure ${pressure / 100} hPa
  `);
};

const createLoggingStream = () =>
  merge(
    fromEvent(noble, 'scanStart').mapTo('Scan started'),
    fromEvent(noble, 'scanStop').mapTo('Scan stopped'),
    fromEvent(noble, 'warning'),
  );

const createStateChangeStream = () =>
  fromEvent(noble, 'stateChange').pipe(
    partition(state => state === 'poweredOn')
  );

const mapObjectFormat = R.applySpec({
  meta: beaconObj,
  data: R.compose(sensorObj, manufacturerData)
});

const createDiscoverStream = () =>
  fromEvent(noble, 'discover').pipe(
    filter(R.compose(isBeacon, manufacturerData)),
    map(mapObjectFormat),
    tap(logMeasurements),
  );

createLoggingStream().subscribe(console.log);

const states$ = createStateChangeStream();
states$[0].subscribe(startScanning(noble));
states$[1].subscribe(stopScanning(noble));

createDiscoverStream().subscribe(/* store */);

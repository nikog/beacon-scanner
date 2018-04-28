import R from 'ramda';
import Rx from 'rxjs';
// import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { map, mapTo, tap, partition, filter } from 'rxjs/operators';
import Influx from 'influx';
import noble from 'noble';

import { isBeacon, beaconObject, sensorObject } from './beacon';

// const influx = new Influx.InfluxDB({
//     host: 'localhost',
//     database: 'weather_db'
// });

process.env['NOBLE_REPORT_ALL_HCI_EVENTS'] = 1;

const BEACON_UUIDS = [
  'f1c81b57ef4048f5a0e4e95f661bfcd7',
  '3eebdcae8a264fe1b8b0d2a89b89ee41'
];

const startScanning = noble => () => noble.startScanning([], true);
const stopScanning = noble => () => noble.stopScanning();

const logMeasurements = ({ uuid, humidity, temperature, pressure }) => {
  console.log(`
    UUID ${uuid}
    Humidity ${humidity} %
    Temperature ${temperature} C
    Air pressure ${pressure / 100} hPa
  `);
};

const dbStoreMeasurements = R.curry((influx, { uuid, humidity, temperature, pressure }) => {
  influx.writePoints([{
    measurement: 'weather',
    tags: {
      beacon: uuid
    },
    fields: {
      humidity: humidity,
      temperature: temperature,
      airPressure: pressure
    }
  }]);
});

const createLoggingStream = () => (
  merge(
    fromEvent(noble, 'scanStart').mapTo('Scan started'),
    fromEvent(noble, 'scanStop').mapTo('Scan stopped'),
    fromEvent(noble, 'warning')
  )
);

const createStateChangeStream = () => (
  fromEvent(noble, 'stateChange').pipe(
    tap(state => console.log('State changed to', state)),
    partition(state => state === 'poweredOn')
  )
);

const createDiscoverStream = () => (
  fromEvent(noble, 'discover').pipe(
    filter(isBeacon),
    map(R.converge(R.merge, [ sensorObject, beaconObject ])),
    tap(logMeasurements)
  )
);

createLoggingStream().subscribe(console.log);

const states$ = createStateChangeStream();
states$[0].subscribe(startScanning(noble));
states$[1].subscribe(stopScanning(noble));

createDiscoverStream().subscribe(/*dbStoreMeasurements(influx)*/);

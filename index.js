const Influx = require('influx');
const noble = require('noble');
const R = require('ramda');
const { Observable } = require('rxjs/Observable');
const { Subject } = require('rxjs/Subject');
require('rxjs/add/observable/merge');
require('rxjs/add/observable/fromEvent');
require('rxjs/add/operator/map');
require('rxjs/add/operator/mapTo');
require('rxjs/add/operator/do');
require('rxjs/add/operator/filter');
require('rxjs/add/operator/partition');
const { isBeacon, beaconObject, sensorObject } = require('./beacon');
const { temperature, humidity, pressure} = require('./sensors');

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'weather_db'
});

process.env['NOBLE_REPORT_ALL_HCI_EVENTS'] = 1;

const BEACON_UUIDS = [
    'f1c81b57ef4048f5a0e4e95f661bfcd7',
    '3eebdcae8a264fe1b8b0d2a89b89ee41'
];

const startScanning = noble => () => noble.startScanning([], true);
const stopScanning = noble => () => noble.stopScanning();

const logMeasurements = ({ uuid, humidity, temperature, pressure }) => {
    console.log('------------------------');
    console.log('UUID', uuid);
    console.log('Humidity', humidity, '%');
    console.log('Temperature', temperature, 'C');
    console.log('Air pressure', pressure / 100, 'hPa');
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

const createLog$ = () => (
    Observable.merge(
        Observable.fromEvent(noble, 'scanStart').mapTo('Scan started'),
        Observable.fromEvent(noble, 'scanStop').mapTo('Scan stopped'),
        Observable.fromEvent(noble, 'warning')
    )
);

const createStateChanges$ = () => (
    Observable.fromEvent(noble, 'stateChange')
        .do(state => console.log('State changed to', state))
        .partition(state => state === 'poweredOn')
);

const createDiscover$ = () => (
    Observable.fromEvent(noble, 'discover')
        .filter(isBeacon)
        .map(R.converge(R.merge, [ sensorObject, beaconObject ]))
        .do(logMeasurements)
);

createLog$().subscribe(console.log);

const states$ = createStateChanges$();
states$[0].subscribe(startScanning(noble));
states$[1].subscribe(stopScanning(noble));

createDiscover$().subscribe(dbStoreMeasurements(influx));

noble.state = 'poweredOn';

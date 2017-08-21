const R = require('ramda');
const { temperature, humidity, pressure} = require('./sensors');

const MANUFACTURER_ID = '9904';

// beacon
const manufacturerId = R.slice(0, 4);
const stripManufacturerId = R.slice(4, Infinity);
const manufacturerData = R.path(['advertisement', 'manufacturerData']);
const manufacturerDataAsHex = R.compose(manufacturerData => manufacturerData.toString('hex'), manufacturerData);
const isBeacon = R.allPass([
    manufacturerData,
    R.compose(R.equals(MANUFACTURER_ID), manufacturerId, manufacturerDataAsHex)
]);

const beaconObject = R.pick(['uuid']);
const sensorObject = R.compose(
    R.mergeAll,
    R.ap(R.map(([ key, transformation ]) => R.compose(R.objOf(key), transformation), [
        ['temperature', temperature ],
        ['humidity', humidity ],
        ['pressure', pressure ]
    ])),
    R.of,
    stripManufacturerId,
    manufacturerDataAsHex
);

module.exports = { isBeacon, beaconObject, sensorObject };

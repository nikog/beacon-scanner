
import {
  slice,
  path,
  compose,
  allPass,
  equals,
  pick,
  ap,
  map,
  objOf,
  of,
  mergeAll,
  tap,
  zipObj
} from 'ramda';
import { temperature, humidity, pressure } from './sensors';

const MANUFACTURER_ID = '9904';

// beacon
const stripManufacturerId = slice(4, Infinity);
const manufacturerData = path(['advertisement', 'manufacturerData']);
const manufacturerDataAsHex = compose(
  manufacturerData => manufacturerData.toString('hex'),
  manufacturerData
);

const beaconObject = pick(['uuid']);
const sensorObject = compose(
  compose(
    zipObj(['temperature', 'humidity', 'pressure']),
    ap([temperature, humidity, pressure]),
  ),
  of,
  stripManufacturerId,
  manufacturerDataAsHex
);

const manufacturerId = slice(0, 4);
const isBeacon = allPass([
  manufacturerData,
  compose(
    equals(MANUFACTURER_ID),
    manufacturerId,
    manufacturerDataAsHex
  )
]);

export { isBeacon, beaconObject, sensorObject };

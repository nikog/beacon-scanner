import { pathOr, merge, objOf, slice, path, compose, allPass, equals, pick, ap, of, zipObj, curry, reduce, assoc, keys } from 'ramda';
import { temperature, humidity, pressure } from './sensors';

const MANUFACTURER_ID = '9904';

// beacon
const toHexString = data => data.toString('hex');
const mapFunctions = curry((functions, data) =>
  reduce((acc, key) => assoc(key, functions[key](data), acc), {}, keys(functions))
);

const beaconObj = pick(['uuid']);
const sensorObj = compose(
  mapFunctions({ temperature, humidity, pressure }),
  slice(4, Infinity)
);

const manufacturerData = compose(
  toHexString,
  pathOr('', ['advertisement', 'manufacturerData'])
);

const isBeacon = compose(equals(MANUFACTURER_ID), slice(0, 4));

export { manufacturerData, isBeacon, beaconObj, sensorObj };

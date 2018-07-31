import {
  applySpec,
  pathOr,
  slice,
  compose,
  equals,
  pick,
  curry,
  reduce,
  assoc,
  keys
} from 'ramda';
import { temperature, humidity, pressure } from './sensors';

const MANUFACTURER_ID = '9904';

const toHexString = data => data.toString('hex');

// TODO: Unneccessary?
// const mapFunctions = curry((functions, data) =>
//   reduce(
//     (acc, key) => assoc(key, functions[key](data), acc),
//     {},
//     keys(functions)
//   )
// );

const manufacturerData = compose(
  toHexString,
  pathOr('', ['advertisement', 'manufacturerData'])
);

const metaData = pick(['uuid']);
const sensorData = compose(
  applySpec({ temperature, humidity, pressure }),
  slice(4, Infinity),
  manufacturerData
);

const isBeacon = compose(
  equals(MANUFACTURER_ID),
  slice(0, 4),
  manufacturerData
);

export { isBeacon, metaData, sensorData };

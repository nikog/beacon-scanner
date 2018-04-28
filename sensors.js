import {
  flip,
  divide,
  slice,
  compose,
  sum,
  ap,
  of,
  add,
  tap
} from 'ramda';

// utils
const divideBy = flip(divide);
const hexToInt = hex => parseInt(hex, 16);
const value = sliceFn => compose(
  hexToInt,
  sliceFn
);

// humidity
const humidityString = slice(2, 4);
const humidityScale = divideBy(2);
const humidity = compose(
  humidityScale,
  value(humidityString)
);

// temperature
const temperatureString = slice(4, 6);
const temperatureInteger = value(temperatureString);
const temperatureFractionString = slice(6, 8);
const decimals = divideBy(100);
const temperatureFraction = compose(
  decimals,
  value(temperatureFractionString)
);

const temperature = compose(
  sum,
  ap([
    temperatureInteger,
    temperatureFraction
  ]),
  of
);

// pressure
const pressureString = slice(8, 12);
const pressureFormat = add(50000);
const pressure = compose(
  pressureFormat,
  value(pressureString)
);

export {
  temperature,
  humidity,
  pressure
};

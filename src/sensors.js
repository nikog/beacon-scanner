import { flip, divide, slice, compose, sum, ap, of, add } from 'ramda';

// utils
const divideBy = flip(divide);
const hexToInt = hex => parseInt(hex, 16);

// humidity
const humidity = compose(divideBy(2), hexToInt, slice(2, 4));

// temperature
const temperatureInteger = compose(hexToInt, slice(4, 6));
const temperatureFraction = compose(divideBy(100), hexToInt, slice(6, 8));
const temperature = compose(
  sum,
  ap([temperatureInteger, temperatureFraction]),
  of
);

// pressure
const pressure = compose(add(50000), hexToInt, slice(8, 12));

export { temperature, humidity, pressure };

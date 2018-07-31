import { flip, divide, slice, compose, sum, ap, of, add } from 'ramda';

// utils
const divideBy = flip(divide);
const hexToInt = hex => parseInt(hex, 16);
const sliceFromHexToInt = (a, b) => compose(hexToInt, slice(a, b));

// humidity
const humidity = compose(divideBy(2), sliceFromHexToInt(2, 4));

// temperature
const temperatureInteger = sliceFromHexToInt(4, 6);
const temperatureFraction = compose(divideBy(100), sliceFromHexToInt(6, 8));
const temperature = compose(sum, ap([temperatureInteger, temperatureFraction]), of);

// pressure
const pressure = compose(add(50000), sliceFromHexToInt(8, 12));

export { temperature, humidity, pressure };

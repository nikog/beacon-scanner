const R = require('ramda');

// utils
const hexToInt = hex => parseInt(hex, 16);
const decimals = R.divide(R.__, 100);
const parseSignedInt8 = int => Int8Array.of(int)[0];

// humidity
const humidityString = R.slice(2, 4);
const humidityScale = R.divide(R.__, 2);

const humidity = R.compose(humidityScale, hexToInt, humidityString);

// temperature
const temperatureString = R.slice(4, 6);
const temperatureFractionString = R.slice(6, 8);
const temperatureInteger = R.compose(parseSignedInt8, hexToInt, temperatureString);
const temperatureFraction = R.compose(decimals, hexToInt, temperatureFractionString);

const temperature = R.compose(R.sum, R.ap([temperatureInteger, temperatureFraction]), R.slice(0, 1), R.of);

// pressure
const pressureString = R.slice(8, 12);
const pressureFormat = R.add(R.__, 50000);

const pressure = R.compose(pressureFormat, hexToInt, pressureString);

module.exports = {
    temperature,
    humidity,
    pressure
};

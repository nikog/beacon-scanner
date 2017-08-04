const noble = require('noble');
const R = require('ramda');

process.env['NOBLE_REPORT_ALL_HCI_EVENTS'] = 1;

noble.state = 'poweredOn';

noble.on('scanStart', () => console.log('Scan started'));
noble.on('scanStop', () => console.log('Scan stopped'));

noble.on('discover', (peripheral) => {
    if (
        ['f1c81b57ef4048f5a0e4e95f661bfcd7'].includes(peripheral.uuid)
    ) {
        console.log('found', peripheral.uuid);

        parseRuuviData(peripheral.advertisement.manufacturerData.toString('hex'));
    }
});
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    } else {
        noble.stopScanning();
    }
});
noble.on('warning', console.log);

const parseRuuviData = (manufacturerDataWithId) => {
    const manufacturerData = stripManufacturerId(manufacturerDataWithId);

    console.log('Humidity', humidity(manufacturerData));
    console.log('Temperature', temperature(manufacturerData));
    console.log('Air pressure', pressure(manufacturerData));
}

const stripManufacturerId = R.slice(4, Infinity);

const hexToInt = hex => parseInt(hex, 16);
const decimals = R.divide(R.__, 100);
const parseSignedInt8 = int => Int8Array.of(int)[0];
const parseUnsignedInt16 = int => Uint16Array.of(int)[0];
const list = R.unapply(R.identity);

// humidity
const humidityString = R.slice(2, 4);
const humidityScale = R.divide(R.__, 2);
const humidity = R.compose(humidityScale, hexToInt, humidityString);

// temperature
const temperatureString = R.slice(4, 6);
const temperatureFractionString = R.slice(6, 8);
const temperatureInteger = R.compose(parseSignedInt8, hexToInt, temperatureString);
const temperatureFraction = R.compose(decimals, hexToInt, temperatureFractionString);
const temperature = R.compose(R.sum, R.ap([temperatureInteger, temperatureFraction]), list);

// pressure
const pressureString = R.slice(8, 12);
const pressureFormat = R.subtract(R.__, 50000);
const pressure = R.compose(pressureFormat, parseUnsignedInt16, hexToInt, pressureString);

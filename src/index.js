import { merge, fromEvent } from 'rxjs';
import { map, mapTo, filter } from 'rxjs/operators';
import noble from 'noble';

import { isBeacon, formatData } from './beacon';

const startScanning = scanner => () => scanner.startScanning([], true);
const stopScanning = scanner => () => scanner.stopScanning();

const logMeasurements = ({
  meta: { uuid },
  data: { humidity, temperature, pressure }
}) => {
  console.log(`
    UUID ${uuid}
    Humidity ${humidity} %
    Temperature ${temperature} C
    Air pressure ${pressure / 100} hPa
  `);
};

const log$ = merge(
  fromEvent(noble, 'scanStart').pipe(mapTo('Scan started')),
  fromEvent(noble, 'scanStop').pipe(mapTo('Scan stopped')),
  fromEvent(noble, 'warning')
);

log$.subscribe(console.log);

const stateChange$ = fromEvent(noble, 'stateChange');
const poweredOn$ = stateChange$.pipe(filter(state => state === 'poweredOn'));
const poweredOff$ = stateChange$.pipe(filter(state => state !== 'poweredOn'));

poweredOn$.subscribe(startScanning(noble));
poweredOff$.subscribe(stopScanning(noble));

const discover$ = fromEvent(noble, 'discover').pipe(
  filter(isBeacon),
  map(formatData)
);

discover$.subscribe(logMeasurements);

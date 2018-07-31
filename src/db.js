import Influx from 'influx';
import { compose } from 'ramda';

// const influx = new Influx.InfluxDB({
//     host: 'localhost',
//     database: 'weather_db'
// });

const measurementPoint = ({
  uuid, humidity, temperature, pressure,
}) => ({
  tags: {
    beacon: uuid,
  },
  fields: {
    humidity,
    temperature,
    airPressure: pressure,
  },
});

const writeMeasurement = point => influx.writeMeasurement('weather', [point]);

const store = compose(writeMeasurement, measurementPoint);

export { store };

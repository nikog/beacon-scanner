import { InfluxDB } from 'influx';
import { compose, curry } from 'ramda';

const DB_HOST = 'localhost';
const DB_NAME = 'weather_db';

const influx = new InfluxDB({
  host: DB_HOST,
  database: DB_NAME
});

const createDatabase = db => () => {
  db
    .getDatabaseNames()
    .then(names => !names.includes(DB_NAME) && db.createDatabase(DB_NAME))
    .catch(console.error);
};

const measurementPoint = ({ meta: { uuid }, data }) => ({
  tags: {
    beacon: uuid
  },
  fields: data
});

const writeMeasurement = curry((db, point) =>
  db.writeMeasurement('weather', [point]).catch(console.error)
);

const init = createDatabase(influx);
const store = compose(writeMeasurement(influx), measurementPoint);

export { init, store };

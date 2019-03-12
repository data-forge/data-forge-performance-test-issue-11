var Stopwatch = require('statman-stopwatch');
var stopwatch = new Stopwatch();

stopwatch.start();
const dataForge = require('data-forge');
const moment = require('moment');
stopwatch.stop();
console.log("Time to require: " + stopwatch.read());

stopwatch.start();
const data = [
    { date: moment().toDate(), value: 1 },
    { date: moment().add(1, 'days').toDate(), value: 3 },
    { date: moment().add(5, 'days').toDate(), value: 2 },
    { date: moment().add(6, 'days').toDate(), value: 6 },
    { date: moment().add(7, 'days').toDate(), value: 5 },
    { date: moment().add(12, 'days').toDate(), value: 2 },
    { date: moment().add(15, 'days').toDate(), value: 9 },
    { date: moment().add(16, 'days').toDate(), value: 9 },
    { date: moment().add(17, 'days').toDate(), value: 9 },
    { date: moment().add(18, 'days').toDate(), value: 9 },
    { date: moment().add(19, 'days').toDate(), value: 9 },
    { date: moment().add(30, 'days').toDate(), value: 9 },
    { date: moment().add(31, 'days').toDate(), value: 9 },
    { date: moment().add(32, 'days').toDate(), value: 9 },
    { date: moment().add(33, 'days').toDate(), value: 9 },
    { date: moment().add(34, 'days').toDate(), value: 9 },
    { date: moment().add(35, 'days').toDate(), value: 9 },
    { date: moment().add(36, 'days').toDate(), value: 9 },
    { date: moment().add(37, 'days').toDate(), value: 9 },
    { date: moment().add(38, 'days').toDate(), value: 9 },
    { date: moment().add(39, 'days').toDate(), value: 9 },
    { date: moment().add(40, 'days').toDate(), value: 9 },
    { date: moment().add(41, 'days').toDate(), value: 9 },
    { date: moment().add(42, 'days').toDate(), value: 9 },
    { date: moment().add(50, 'days').toDate(), value: 9 },
    { date: moment().add(51, 'days').toDate(), value: 9 },
    { date: moment().add(52, 'days').toDate(), value: 9 },
];
const df = new dataForge.DataFrame(data).setIndex('date');

const gapExists = (pairA, pairB) => {
  // Return true if there is a gap longer than a day.
  // Log when we enter this function
  // console.log('gapExists [pairA, pairB]', [pairA, pairB]);
  const startDate = pairA[1].date;
  const endDate = pairB[1].date;
  const gapSize = moment(endDate).startOf('day').diff(moment(startDate).startOf('day'), 'days');
  return gapSize > 1;
};

const gapFiller = (pairA, pairB) => {
  const startDate = pairA[1].date;
  const endDate = pairB[1].date;
  const gapSize = moment(endDate).startOf('day').diff(moment(startDate).startOf('day'), 'days');
  const numEntries = gapSize - 1;

  const newEntries = [];

  for (let entryIndex = 0; entryIndex < numEntries; entryIndex += 1) {
    const newValue = { date: pairA[1].date, value: pairA[1].value };
    newValue.date = moment(pairA[1].date).add(entryIndex + 1, 'days').toDate();

    newEntries.push([
      moment(pairA[0]).add(entryIndex + 1, 'days').toDate(), // New index
      newValue, // New value
    ]);
  }

  return newEntries;
};

const dfWithoutGaps = df.fillGaps(gapExists, gapFiller);

// START OF KEY PART
const mySeries = dfWithoutGaps.getSeries('value');
// END OF KEY PART
stopwatch.stop();
console.log("Time to create DataFrame and getSeries: " + stopwatch.read());

stopwatch.start();
const smaPeriod = 3;
const smaSeries = mySeries
  .rollingWindow(smaPeriod)
  .select(window => window.sum() / smaPeriod);

smaSeries.toArray()

stopwatch.stop();
console.log("Time for rolling window and toArray(): " + stopwatch.read());

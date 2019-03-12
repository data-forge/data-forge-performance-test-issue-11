var Stopwatch = require('statman-stopwatch');
var stopwatch = new Stopwatch();

stopwatch.start();
const dataForge = require('data-forge');
const moment = require('moment');
stopwatch.stop();
console.log("Time to require: " + stopwatch.read());

stopwatch.start();
const data = [];
for (let i = 0; i < 100; i += 1) {
  data.push({ date: moment().add(i, 'days').toDate(), value: i });
}
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
const mySeries = new dataForge.Series(dfWithoutGaps.getSeries('value').toArray());
// END OF KEY PART
stopwatch.stop();
console.log("Time to create DataFrame and getSeries: " + stopwatch.read());

stopwatch.start();
df.toPairs();
stopwatch.stop();
console.log("df.toPairs: " + stopwatch.read());

stopwatch.start();
dfWithoutGaps.toPairs();
stopwatch.stop();
console.log("dfWithoutGaps.toPairs: " + stopwatch.read());

stopwatch.start();
const smaPeriod = 3;
const smaSeries = mySeries
  .rollingWindow(smaPeriod)
  .select(window => val = window.sum() / smaPeriod);
stopwatch.stop();
console.log("Time for rolling window: " + stopwatch.read());

stopwatch.start();
smaSeries.toPairs();
stopwatch.stop();
console.log("Time for toPairs: " + stopwatch.read());

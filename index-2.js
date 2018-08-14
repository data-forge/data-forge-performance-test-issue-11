
const dataForge = require('data-forge');
const moment = require('moment');

var Stopwatch = require('statman-stopwatch');
var stopwatch = new Stopwatch();
stopwatch.start();

const data = [
    { date: moment().toDate(), value: 1 },
    { date: moment().add(1, 'days').toDate(), value: 3 },
    { date: moment().add(5, 'days').toDate(), value: 2 },
    { date: moment().add(6, 'days').toDate(), value: 6 },
    { date: moment().add(7, 'days').toDate(), value: 5 },
    { date: moment().add(12, 'days').toDate(), value: 2 },
    { date: moment().add(15, 'days').toDate(), value: 9 },
  ];
  const df = new dataForge.DataFrame(data).setIndex('date');

  const gapExists = (pairA, pairB) => {
    // Return true if there is a gap longer than a day.
    // Log when we enter this function
    console.log('gapExists [pairA, pairB]', [pairA, pairB]);
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

  // In this case, the final value of dfWithoutGaps is
  // what you'd expect and the number of entries into
  // gapExists is about what I'd expect.
  //
  // I say "about" what I'd expect because there are
  // two seemingly identical comparisons made between the
  // first two items of the data set for a total
  // execution count of 7 when I'd expect 6.
  const dfWithoutGaps = df.fillGaps(gapExists, gapFiller);
  console.log('dfWithoutGaps', dfWithoutGaps.toArray());

  // With the following line uncommented the rollingWindow
  // call below will trigger a huge number of calls to
  // gapExists (I'm not sure how many but enough to max out the
  // buffer in my browser's debug console). It appears as if
  // fillGaps is being run for each rolling window.
  //
  // The speed of generating the rolling window in this
  // scenario is very slow.
  // const mySeries = dfWithoutGaps.getSeries('value');


  // If we force the lazy evaluation via the line below and then
  // run rollingWindow we'll get the expected number of calls (6) to
  // gapExists.
  //
  // The speed of generating the rolling window in this scenario
  // is very fast.
  // https://github.com/data-forge/data-forge-ts/blob/master/docs/guide.md#lazy-evaluation-through-iterators
  const mySeries = new dataForge.Series(dfWithoutGaps.getSeries('value').toArray());

  const smaPeriod = 3;
  const smaSeries = mySeries
    .rollingWindow(smaPeriod)
    .select(window => window.sum() / smaPeriod);

  console.log('smaSeries', smaSeries.toArray());

stopwatch.stop();
console.log("Time [2]: " + stopwatch.read());
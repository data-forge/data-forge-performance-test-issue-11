var Stopwatch = require('statman-stopwatch');
var stopwatch = new Stopwatch();
stopwatch.start();

const dataForge = require('data-forge');
const moment = require('moment');


stopwatch.stop();
console.log("Time [A]: " + stopwatch.read());
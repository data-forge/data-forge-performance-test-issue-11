var Stopwatch = require('statman-stopwatch');
var stopwatch = new Stopwatch();
stopwatch.start();

console.log("Hello");

stopwatch.stop();
console.log("Time [B]: " + stopwatch.read());
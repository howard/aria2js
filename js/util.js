/**
 * Converts a byte number into human readable format.
 * 
 * @param {Number} bytes Byte number to convert.
 * @param {Number} precision Number of decimal places to display.
 *
 * @returns {String} Number of bytes converted to the highesst reasonable unit,
 *                    including name of unit.
 */
var humanizeBytes = function (bytes, precision) {
  var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var negativeFlag = false;
  if (!precision) precision = 0;
  if (bytes == 0) return '0 B';
  if (bytes < 0) { // I have never seen anyone using negative bytes, but let's stay safe.
    negativeFlag = true;
    bytes *= -1;
  }
  var n = parseInt(Math.floor(Math.log(bytes)  / Math.log(1024)));
  //return (negativeFlag ? -1 : 1) * Math.round(bytes / Math.pow(1024, n), 2) + ' ' + units[n];
  return ((negativeFlag ? -1 : 1) * bytes / Math.pow(1024, n)).toFixed(precision) + ' ' + units[n];
};

/**
 * Prints stuff to console; useful for debugging, in case you need a one
 * parameter callback. Tried to use just console.log in Chrome, didn't work for
 * me.
 */
var log = function (data) {
  console.log(data);
};
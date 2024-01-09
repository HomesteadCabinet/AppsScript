const _ = LodashGS.load();
const now = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);



function formatByteSize(bytes) {
  if(bytes < 1024) return bytes + " bytes";
  else if(bytes < 1048576) return Math.round((bytes / 1024), 3) + " KiB";
  else if(bytes < 1073741824) return Math.round((bytes / 1048576), 3) + " MiB";
  else return(bytes / 1073741824).toFixed(3) + " GiB";
}


function roughSizeOfObject( value, level ) {
  function clear__visited__(value){
    if(typeof value == 'object'){
      delete value['__visited__'];
      for(var i in value){
        clear__visited__(value[i]);
      }
    }
  }

  if(level == undefined) level = 0;
  var bytes = 0;

  if ( typeof value === 'boolean' ) {
      bytes = 4;
  }
  else if ( typeof value === 'string' ) {
      bytes = value.length * 2;
  }
  else if ( typeof value === 'number' ) {
      bytes = 8;
  }
  else if ( typeof value === 'object' ) {
      if(value['__visited__']) return 0;
      value['__visited__'] = 1;
      for( i in value ) {
          bytes += i.length * 2;
          bytes+= 8; // an assumed existence overhead
          bytes+= roughSizeOfObject( value[i], 1 )
      }
  }

  if(level == 0){
      clear__visited__(value);
  }
  return bytes;
}


// Enhanched boolean function, checks for: empty strings, objects, arrays, null, undefined, etc.
function isNothing(thing) {
  if (isObject(thing)) {
    return _.isEmpty(thing);
  }
  if (thing === undefined || thing === null || (isNaN(thing) && typeof thing == 'number')) {
    return true;
  } else {
    if (thing.constructor === String || isArray(thing)) {
      return !thing.length;
    } else return false;
  }
}


function isSomething(thing) {
  return !isNothing(thing);
}


// Quick type identifier functions
function isObject(thing) {
  return (!!thing) && (thing.constructor === Object);
}


function isArray(thing) {
  return (!!thing) && (thing.constructor === Array);
}


function isDecimal(number) {
  return !!(number % 1);
}


function isIdentical(obj1, obj2) {
  // Checks if two objects are identical
  return _.isEqual(obj1, obj2);
}


function initData(
    data, headers,
    options={
      date_key: 'mtime',
      months: 12,
    }
  ) {
  let rtn = [];
  for (let row of data) {
    let d = _.zipObject(headers, row);
    if (options.months && options.date_key) {
      if (options.date_key[0] == '-') options.date_key = options.date_key.slice(1);
      console.log(d[options.date_key], options, new Date(d[options.date_key]) > new Date(now.getFullYear(), now.getMonth() - options.months, now.getDate()))
      if (new Date(d[options.date_key]) > new Date(now.getFullYear(), now.getMonth() - options.months, now.getDate())) {
        rtn.push(d);
      }
    } else rtn.push(d);
  }
  return rtn;
}


function sortBy(array, key) {
  // Sorts an array of objects by the key provided
  if (key) {
    if (key[0] == "-") {
      key = key.slice(1);
      array.sort((a, b) => {
        return new Date(b[key]) - new Date(a[key]);
      });
    } else {
      array.sort((a, b) => new Date(a[key]) - new Date(b[key]));
    }
  }
  return array;
}

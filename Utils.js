
function formatByteSize(bytes) {
  if(bytes < 1024) return bytes + " bytes";
  else if(bytes < 1048576) return Math.round((bytes / 1024), 3) + " KiB";
  else if(bytes < 1073741824) return Math.round((bytes / 1048576), 3) + " MiB";
  else return(bytes / 1073741824).toFixed(3) + " GiB";
};

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



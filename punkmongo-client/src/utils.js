
export default {
  bytesFormatted: function(bytes) {
    if (bytes <= 1073741824) { // less than 1GB
      // show in MB
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    } else if (bytes <= 1099511627776) { // less than 1TB
      // show in GB
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    } else {
      // show in TB
      return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)  + ' TB';
    }
  },
  numberWithCommas: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
  }
}
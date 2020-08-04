export default {
    bytesFormatted: function(bytes, forceUnit) {
        if (typeof bytes == 'undefined') {
            return '...';
        }
        if (forceUnit) {
            switch (forceUnit) {
                case 'KB':
                    return (bytes / 1024).toFixed(2) + ' KB'
                case 'MB':
                    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
                case 'GB':
                    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
                case 'TB':
                    return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
            }
        }

        if (bytes <= 1073741824) { // less than 1GB
            // show in MB
            return (bytes / 1024 / 1024).toFixed(2) + ' MB';
        } else if (bytes <= 1099511627776) { // less than 1TB
            // show in GB
            return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        } else {
            // show in TB
            return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB';
        }
    },
    numberWithCommas: function(x) {
        if (typeof x == 'undefined') {
            return '...';
        }
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    removeDocumentSelection: function() {
        if (document.selection) {
            document.selection.empty();
        } else {
            window.getSelection().removeAllRanges();
        }
    },
    copyToClipboard: function(str) {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
}
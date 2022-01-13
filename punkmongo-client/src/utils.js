function noMinus(value) {
    return value.toString().replace('-', '');
}

export default {
    bytesFormatted: function(bytes, forceUnit, toFixed = 2, space = true) {
        if (space) {
            space = ' ';
        } else {
            space = '';
        }

        if (typeof bytes == 'undefined') {
            return '...';
        }
        if (forceUnit) {
            switch (forceUnit) {
                case 'KB':
                    return noMinus((bytes / 1024).toFixed(toFixed)) + space + 'KB'
                case 'MB':
                    return noMinus((bytes / 1024 / 1024).toFixed(toFixed)) + space + 'MB'
                case 'GB':
                    return noMinus((bytes / 1024 / 1024 / 1024).toFixed(toFixed)) + space + 'GB'
                case 'TB':
                    return noMinus((bytes / 1024 / 1024 / 1024 / 1024).toFixed(toFixed)) + space + 'TB'
            }
        }

        if (bytes <= 1073741824) { // less than 1GB
            // show in MB
            return noMinus((bytes / 1024 / 1024).toFixed(toFixed)) + space + 'MB';
        } else if (bytes <= 1099511627776) { // less than 1TB
            // show in GB
            return noMinus((bytes / 1024 / 1024 / 1024).toFixed(toFixed)) + space + 'GB';
        } else {
            // show in TB
            return noMinus((bytes / 1024 / 1024 / 1024 / 1024).toFixed(toFixed)) + space + 'TB';
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
    },
    isInViewport: function(el) {
        var rect = el.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;

        // Only completely visible elements return true:
        // const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);

        // Partially visible elements return true:
        const isVisible = elemTop < window.innerHeight && elemBottom >= 0;

        return isVisible;
    },
    setCaret: function(el, childNodeNum, position) {
        var range = document.createRange();
        var sel = window.getSelection();
        
        range.setStart(el.childNodes[childNodeNum], position);
        range.collapse(true);
        
        sel.removeAllRanges();
        sel.addRange(range);
    }
 
}


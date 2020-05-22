const jsStringify = require('javascript-stringify').stringify;




function getTypeDescriptorForValue(value) {
    const TYPE_TO_STRING = new Map([
        ['[object Array]', 'Array'],
        ['[object Object]', 'Object'],
        ['[object String]', 'String'],
        ['[object Date]', 'Date'],
        ['[object Number]', 'Number'],
        ['[object Function]', 'Function'],
        ['[object RegExp]', 'RegExp'],
        ['[object Boolean]', 'Boolean'],
        ['[object Null]', 'Null'],
        ['[object Undefined]', 'Undefined']
    ]);

    const type = TYPE_TO_STRING.get(Object.prototype.toString.call(value));

    const isBson = (type === 'Object' && value._bsontype);
    return {
        type: isBson || type,
        isBSON: !!isBson
    };
}

const BSON_TO_JS_STRING = {
    Code: function(v) {
        const codeEscaped = v.code.replace(/'/g, `\\'`);
        if (v.scope) {
            return `Code('${codeEscaped}',${JSON.stringify(v.scope)})`;
        }
        return `Code('${codeEscaped}')`;
    },
    ObjectID: function(v) {
        return `ObjectId('${v.toString('hex')}')`;
    },
    ObjectId: function(v) {
        return `ObjectId('${v.toString('hex')}')`;
    },
    Binary: function(v) {
        const subType = v.sub_type;
        if (subType === 4) {
            return `UUID("${v.buffer.toString('hex')}")`;
        }
        return `BinData(${subType.toString(16)}, '${v.buffer.toString('base64')}')`;
    },
    DBRef: function(v) {
        let dbIfExists = '';
        if (v.db) {
            dbIfExists = `, ${stringifyValue(v.db)}`;
        }
        return `DBRef(${stringifyValue(v.collection)}, ${stringifyValue(v.oid)}${dbIfExists})`;
    },
    Timestamp: function(v) {
        return `Timestamp(${v.getLowBits()}, ${v.getHighBits()})`;
    },
    Long: function(v) {
        return `NumberLong(${v.toString()})`;
    },
    Decimal128: function(v) {
        return `NumberDecimal('${v.toString()}')`;
    },
    Int32: function(v) {
        return `NumberInt{'${v.toString()}')`;
    },
    MaxKey: function() {
        return 'MaxKey()';
    },
    MinKey: function() {
        return 'MinKey()';
    },
    Date: function(v) {
        return `ISODate('${v.toISOString()}')`;
    },
    ISODate: function(v) {
        return `ISODate('${v.toISOString()}')`;
    },
    RegExp: function(v) {
        let o = '';
        let hasOptions = false;

        if (v.global) {
            hasOptions = true;
            o += 'g';
        }
        if (v.ignoreCase) {
            hasOptions = true;
            o += 'i';
        }
        if (v.multiline) {
            hasOptions = true;
            o += 'm';
        }

        return `RegExp('${v.source}'${hasOptions ? `, '${o}'` : ''})`;
    }
};

let defaultStringify = null;
function stringifyValue(value) {
    const typeDescriptor = getTypeDescriptorForValue(value);
    const convertToJs = BSON_TO_JS_STRING[typeDescriptor.type];
    if (!convertToJs) {
        return defaultStringify(value);
    }
    return convertToJs(value);
}


function mongoDocToString(dbDocument, space = '   ') {
    let string = jsStringify(
        dbDocument,
        (value, indent, stringify) => {
            if (! defaultStringify) {
                defaultStringify = stringify;
            }
            return stringifyValue(value, defaultStringify);
        },
        space
    );

    // string = string.replace(/ ?\n ? ?/g, '').replace(/ {2,}/g, ' ');

    return string;
}

module.exports = mongoDocToString;




/*
var SCOPE = {
  RegExp: RegExp,
  Binary: function Binary$1(buffer, subType) {
    return new Binary(buffer, subType);
  },
  BinData: function BinData(t, d) {
    return new Binary(Buffer.from(d, 'base64'), t);
  },
  UUID: function UUID(u) {
    return new Binary(Buffer.from(u.replace(/-/g, ''), 'hex'), 4);
  },
  Code: function Code$1(c, s) {
    return new Code(c, s);
  },
  DBRef: function DBRef$1(namespace, oid, db, fields) {
    return new DBRef(namespace, oid, db, fields);
  },
  Decimal128: function Decimal128$1(s) {
    return Decimal128.fromString(s);
  },
  NumberDecimal: function NumberDecimal(s) {
    return Decimal128.fromString(s);
  },
  Double: function Double$1(s) {
    return new Double(s);
  },
  Int32: function Int32$1(i) {
    return new Int32(i);
  },
  NumberInt: function NumberInt(s) {
    return parseInt(s, 10);
  },
  Long: function Long$1(low, high) {
    return new Long(low, high);
  },
  NumberLong: function NumberLong(v) {
    return Long.fromNumber(v);
  },
  Int64: function Int64(i) {
    return Long.fromNumber(i);
  },
  Map: function Map$1(arr) {
    return new Map(arr);
  },
  MaxKey: function MaxKey$1() {
    return new MaxKey();
  },
  MinKey: function MinKey$1() {
    return new MinKey();
  },
  ObjectID: function ObjectID$1(i) {
    return new ObjectID(i);
  },
  ObjectId: function ObjectId(i) {
    return new ObjectID(i);
  },
  Symbol: function Symbol(i) {
    return new BSONSymbol(i);
  },
  Timestamp: function Timestamp$1(low, high) {
    return new Timestamp(low, high);
  },
  ISODate: function ISODate() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // casting our arguments as an empty array because we don't know
    // the length of our arguments, and should allow users to pass what
    // they want as date arguments
    return _construct(Date, _toConsumableArray(args));
  },
  Date: function (_Date) {
    function Date() {
      return _Date.apply(this, arguments);
    }

    Date.toString = function () {
      return _Date.toString();
    };

    return Date;
  }(function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    // casting our arguments as an empty array because we don't know
    // the length of our arguments, and should allow users to pass what
    // they want as date arguments
    return _construct(Date, _toConsumableArray(args));
  })
};

*/



/*
{
  _id: {
    _bsontype: 'ObjectID',
    id: Uint8Array(12) [
      94, 199,  47, 254,   0,
      49, 107, 232, 124, 171,
      57,  39
    ]
  },
  code: { _bsontype: 'Code', code: 'function () { return 22; }' },
  binary: {
    _bsontype: 'Binary',
    sub_type: 1,
    position: 30,
    buffer: Uint8Array(30) [
      219, 125, 172, 107, 119, 119, 219,
      123,  29, 219, 125, 154, 223, 107,
       29, 107, 123,  54, 119, 118, 182,
      179,  87, 118, 222, 205, 181, 119,
      123,  26
    ]
  },
  dbref: {
    _bsontype: 'DBRef',
    collection: 'test',
    oid: { _bsontype: 'ObjectID', id: [Uint8Array] },
    db: 'nearby_aventura',
    fields: {}
  },
  timestamp: { _bsontype: 'Timestamp', low_: 0, high_: 0 },
  long: 0,
  long1: { _bsontype: 'Long', low_: -1, high_: 2147483647 },
  decimal: {
    _bsontype: 'Decimal128',
    bytes: Uint8Array(16) [
      232, 3,  0,  0, 0, 0,
        0, 0,  0,  0, 0, 0,
        0, 0, 64, 48
    ]
  },
  integer: 12,
  maxkey: { _bsontype: 'MaxKey' },
  minkey: { _bsontype: 'MinKey' },
  isodate: 2012-01-01T00:00:00.000Z,
  regexp: /test/,
  string: 'stringvalue'
}
*/









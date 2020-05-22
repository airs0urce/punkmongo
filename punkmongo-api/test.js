const ejsonParser = require('ejson-shell-parser').default;


const filterData = `{
   _id: ObjectId('5ec72ffe00316be87cab3927'),
   code: Code('function () { return 22; }'),
   binary: BinData(1, '232sa3d323sd232a32sda3s2d3a2s1d23s21d3sa'),
   dbref: DBRef('test', ObjectId('5ec72f4200316be87cab3926'), 'nearby_aventura'),
   timestamp: Timestamp(0, 0),
   'long': 0,
   long1: NumberLong(9223372036854775807),
   decimal: NumberDecimal('1000'),
   integer: 12,
   maxkey: MaxKey(),
   minkey: MinKey(),
   isodate: ISODate('2012-01-01T00:00:00.000Z'),
   regexp: RegExp('test'),
   string: 'stringvalue',
   array: [
      1,
      2,
      3
   ],
   nulll: null,
   object: {
      a: 1,
      b: 2
   },
   undef: null,
   timestamp2: Timestamp(22, 1),
   regexp2: RegExp('test2', 'i'),
   regexp3: RegExp('test3\/', 'i')
}`;

const filter = ejsonParser(filterData, {loose: true, allowComments: false});

console.log(filter);
console.log(typeof filter);
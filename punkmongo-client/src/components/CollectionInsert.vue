<template>
    <div>
        <div class="test-editor language-mongoquery">
        </div>
        <button>Insert</button>
    </div>
</template>
<script>
    import Prism from '@/vendor/prismjs/prism.js';
    import '@/vendor/prismjs/prism.css'
    import {CodeJar} from '@/vendor/codejar/codejar.js';

    export default {
        mounted: function() {
            
            let jar = CodeJar(document.querySelector('.test-editor'), Prism.highlightElement);
            jar.updateCode(`{
   '_id': ObjectId('5ec72ffe00316be87cab3927'),
   'code': Code('function () { return 22; }'),
   'binary': BinData(1, '232sa3d323sd232a32sda3s2d3a2s1d23s21d3sa'),
   'dbref': DBRef('test', ObjectId('5ec72f4200316be87cab3926'), 'nearby_aventura'),
   timestamp: Timestamp(0, 0),
   'long': 0,
   'long1': NumberLong(9223372036854775807),
   'decimal': NumberDecimal('1000'),
   'integer': 12,
   'maxkey': MaxKey(),
   'minkey': MinKey(),
   'isodate': ISODate('2012-01-01T00:00:00.000Z'),
   'regexp': RegExp('test'),
   'string': 'stringvalue',
   'array': [
   1,
   2,
   3
   ],
   'nulll': null,
   'object': {
      'a': 1,
      'b': 2
  },
  'undef': null,
  'timestamp2': Timestamp(1, 22),
  'regexp2': RegExp('test2', 'i'),
  'regexp3': RegExp('test3\/', 'i'),
  'max_key2': MaxKey(),
  'code2': Code('function test() { return \'fdkfkdfkdf\'; }'),
  'code3': Code('function test() { return "fdkfkdfkdf"; }'),
  'number': 1234,
  'invalid-key': 123,
  'tsNew': Timestamp(1, 23)
}
`);
        }
}


</script>

<style lang="scss">
.test-editor {
    border-radius: 6px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    font-family: 'Source Code Pro', monospace;
    font-size: 14px;
    font-weight: 400;
    height: 340px;
    letter-spacing: normal;
    line-height: 20px;
    padding: 10px;
    tab-size: 4;
}
</style>
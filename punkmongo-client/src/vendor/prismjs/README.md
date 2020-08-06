Forked Prism.js: https://github.com/airs0urce/prism
In forked version I added "monoquery" syntax.

## How to edit, rebuild and add new "prism.js" to Punkmongo project:

### Preparations
Clone repo https://github.com/airs0urce/prism. This is Prism.js with new language definition - mongodb-query
```
$ git clone https://github.com/airs0urce/prism  
$ cd prism  
$ npm install  
```

### How to edit syntax 

Run http server inside prism folder
```
$ npm install -g http-server
$ http-server -c1
```

See what address http server started on and go to test.html, for example:
Open http://127.0.0.1:8080/test.html

On this page select "Mongo Query" and then you can test how highlight works.
Edit "components/prism-mongodb-query.js" and refresh page.

### How to build new version of syntax

Delete old minified version:
```
$ rm -f components/prism-mongodb-query.min.js
```

Build:
```
$ npm run build
```

Start http server if not started yet:
```
$ http-server -c1
```

See what port http server started on and go to download.html, for example:
http://127.0.0.1:8080/download.html

Select "Minified version" and in Languages check "JavaScript" and "Mongo Query"

Go to page bottom and click "Download JS".
Downloaded file will go to [punkmongo_folder]/src/vendor/prismjs/prism.js



const Koa = require('koa');
const app = new Koa();
const koaJsonRpc = require('koa-jsonrpc');
const config = require('./../config');
const DBFactory = require('./DBFactory');
const fs = require('mz/fs');


(async () => {  
  const dbClient = await DBFactory.connectMongo();
  
  const jrpc = koaJsonRpc({
    limit: '20mb',
  });
  
  const apiMethodsPath = __dirname + '/API/';
  const methodFiles = await fs.readdir(apiMethodsPath);
  for (let methodFile of methodFiles) {
    const methodName = methodFile.replace('.js', '');
    const methodFunction = require(apiMethodsPath + methodFile);

    jrpc.use(methodName, async (params) => {
      return await methodFunction(params, dbClient);
    });
  }
  console.log(methodFiles);
  
   
  app.use(jrpc.app());
  app.listen(config.port);
  
  console.log(`Started JSONRPC 2.0 API on ${config.host}:${config.port}`);
})();




// const crypto = require('crypto');
// const token = crypto.createHmac('sha256', config.auth.password).update(config.auth.username).digest('hex')
// console.log('Authorization header:', token)
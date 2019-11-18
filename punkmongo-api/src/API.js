const Koa = require('koa');
const cors = require('koa2-cors');
const koaJsonRpc = require('koa-jsonrpc');
const config = require('./../../config');
const DBFactory = require('./DBFactory');
const fs = require('mz/fs');
const a = require('awaiting');

const app = new Koa();

(async () => {  
  const dbClient = await DBFactory.connectMongo();
  
  const jrpc = koaJsonRpc({
    limit: '20mb',
  });
  
  const apiMethodsPath = __dirname + '/API/';
  const methodFiles = await fs.readdir(apiMethodsPath);
  for (let methodFile of methodFiles) {
    if (! methodFile.includes('.js')) {
      continue;
    }
    const methodName = methodFile.replace('.js', '');
    const methodFunction = require(apiMethodsPath + methodFile);
    
    jrpc.use(methodName, async (params) => {
      return await methodFunction(params, dbClient);
    });
  }
  
  app.use(cors())
  app.use(jrpc.app());
  app.listen(config.api.port);
  
  console.log(`Started JSONRPC 2.0 API on ${config.api.host}:${config.api.port}`);
})();




// const crypto = require('crypto');
// const token = crypto.createHmac('sha256', config.api.auth.password).update(config.api.auth.username).digest('hex')
// console.log('Authorization header:', token)
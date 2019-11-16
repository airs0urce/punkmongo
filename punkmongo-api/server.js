const Koa = require('koa');
const app = new Koa();
const koaJsonRpc = require('koa-jsonrpc');
const config = require('./config');


const jrpc = koaJsonRpc({
  limit: '20mb',
  auth: {
    username: config.auth.username,
    password: config.auth.password
  }
});
 
jrpc.use('user', async function user() {
  return 'root';
});
 
jrpc.use('sum', async function sum(params) {
  return params.a + params.b;
});
 
jrpc.use('internal', async function internal() {
  throw new Error();
});
 
app.use(jrpc.app());
app.listen(3000);


const crypto = require('crypto');
const token = crypto.createHmac('sha256', config.auth.password).update(config.auth.username).digest('hex')
console.log('Authorization header:', token)
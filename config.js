
module.exports = {
  api: {
    domain: 'punkmongolocal.com',
    host: '0.0.0.0',
    port: 3000,
    auth: {
      username: 'admin',
      password: 'admin'
    },
    mongodb: {
      host: '127.0.0.1',
      port: 27017
    }
  },
  client: {
    protocol: 'http://',
    host: '127.0.0.1',
    port: 3000,
  }
  
}

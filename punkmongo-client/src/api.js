const axios = require('axios');
const config = require('../../config');
const uuidv4 = require('uuid/v4');

class API {
  constructor() {
    this.endpoint = `${config.client.protocol}${config.client.host}:${config.client.port}`;
  }

  async request(method, params = {}, id) {
    if (undefined === id) {
      id = uuidv4();
    }
    const response = await axios.post(this.endpoint, {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: id
    });

    
    return response.data;
  }

}

const api = new API();

api.request('listDatabases').then((response) => {
  console.log('response:', response);
});

module.exports = api